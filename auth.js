const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "Security")
);

const SALT_ROUNDS = 12;

// Promise wrappers for SQLite
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Register a new account
exports.register = async function(req, res) {
  try {
    const username =
      typeof req.body.username === "string"
        ? req.body.username.trim()
        : "";

    const password = req.body.password;

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).send(
        "Username must be 3-20 characters."
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 72
    ) {
      return res.status(400).send(
        "Password must be 12-72 characters."
      );
    }

    const existing = await get(
      "SELECT userid FROM users WHERE userid = ?",
      [username]
    );

    if (existing) {
      return res.status(409).send(
        "Username already exists."
      );
    }

    const hash = await bcrypt.hash(
      password,
      SALT_ROUNDS
    );

    // All new accounts receive the user role
    await run(
      `INSERT INTO users (userid, password, role)
       VALUES (?, ?, ?)`,
      [username, hash, "user"]
    );

    return res.redirect("/login");

  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(409).send(
        "Username already exists."
      );
    }

    console.error("Registration error:", err);
    return res.status(500).send(
      "Registration failed."
    );
  }
};

// Authenticate credentials
exports.login = async function(req, res, next) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).send(
        "Invalid login request."
      );
    }

    const user = await get(
      `SELECT userid, password, role
       FROM users WHERE userid = ?`,
      [username]
    );

    if (!user) {
      return res.status(401).send(
        "Invalid username or password."
      );
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).send(
        "Invalid username or password."
      );
    }

    // Prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user.userid;
      req.session.role = user.role;

      req.session.save((err) => {
        if (err) return next(err);
        res.redirect("/newpage");
      });
    });

  } catch (err) {
    next(err);
  }
};

// Protect routes
exports.authenticate = function(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/login");
  }

  next();
};

// Restrict access to admins
exports.requireAdmin = function(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/login");
  }

  if (req.session.role !== "admin") {
    return res.status(403).send(
      "Admin privileges required."
    );
  }

  next();
};

// Admin user listing
exports.users = async function(req, res, next) {
  try {
    const rows = await all(
      "SELECT userid, role FROM users ORDER BY userid"
    );

    // JSON response, without passwords
    res.json(rows);

  } catch (err) {
    next(err);
  }
};

/* -----------------------------------
   ADMIN: DELETE REGISTERED USER
----------------------------------- */

exports.deleteUser = function(req, res) {
    const userid = req.params.userid;

    // Only admins may delete accounts
    if (!req.session || req.session.role !== "admin") {
        return res.status(403).json({
            error: "Admin access required."
        });
    }

    // Prevent admins from deleting themselves
    if (userid === req.session.userId) {
        return res.status(403).json({
            error: "You cannot delete your own account."
        });
    }

    if (!userid || !/^[a-zA-Z0-9_]{3,20}$/.test(userid)) {
        return res.status(400).json({
            error: "Invalid username."
        });
    }

    // Transaction ensures both deletions succeed together
    db.serialize(() => {
        db.run("BEGIN IMMEDIATE TRANSACTION", (beginErr) => {
            if (beginErr) {
                return res.status(500).json({
                    error: "Could not begin deletion."
                });
            }

            const rollback = (error) => {
                console.error("Delete user error:", error);
                db.run("ROLLBACK", () => {
                    res.status(500).json({
                        error: "Could not delete user."
                    });
                });
            };

            db.run(
                "DELETE FROM leaderboard WHERE userid = ?",
                [userid],
                (scoreErr) => {
                    if (scoreErr) return rollback(scoreErr);

                    db.run(
                        "DELETE FROM users WHERE userid = ?",
                        [userid],
                        function(userErr) {
                            if (userErr) return rollback(userErr);

                            if (this.changes === 0) {
                                return db.run("ROLLBACK", () => {
                                    res.status(404).json({
                                        error: "User not found."
                                    });
                                });
                            }

                            db.run("COMMIT", (commitErr) => {
                                if (commitErr) return rollback(commitErr);

                                res.json({
                                    success: true,
                                    message: "User deleted successfully."
                                });
                            });
                        }
                    );
                }
            );
        });
    });
};

// Logout
exports.logout = function(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};
