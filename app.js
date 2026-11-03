
const express = require("express");
const hbs = require("hbs");
const path = require("path");
const axios = require("axios");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);

const auth = require("./auth");
const leaderboard = require("./leaderboard");

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------
// 1. APPLICATION CONFIGURATION
// -----------------------------------

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Public assets
app.use(
  "/public",
  express.static(path.join(__dirname, "public"))
);

// -----------------------------------
// 2. SESSION CONFIGURATION
// -----------------------------------

if (!process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable is required."
  );
}

if (process.env.NODE_ENV === "production") {
  // Enable only when deployed behind a trusted proxy.
  // app.set("trust proxy", 1);
}

app.use(session({
  name: "connect.sid",

  store: new SQLiteStore({
    db: "sessions.sqlite",
    dir: __dirname
  }),

  secret: process.env.SESSION_SECRET,

  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));


// -----------------------------------
// 3. PUBLIC ROUTES
// -----------------------------------

// Redirect homepage to login or Level 1
app.get("/", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/newpage");
    }

    res.redirect("/login");
});

// Registration page
app.get("/title", (req, res) => {
    res.render("title");
});

// Login page
app.get("/login", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/newpage");
    }

    res.render("login");
});


// -----------------------------------
// 4. AUTHENTICATION ROUTES
// -----------------------------------

// Register new user
app.post("/addUser", auth.register);

// Login
app.post("/login", auth.login);

// Logout
app.post(
  "/logout",
  auth.authenticate,
  auth.logout
);

// -----------------------------------
// 5. PROTECTED PUZZLE ROUTES
// -----------------------------------

// Level 1
app.get(
  "/newpage",
  auth.authenticate,
  (req, res) => {
    res.render("newpage", {
      username: req.session.userId,
      level: 1
    });
  }
);
// Level 2
app.get(
  "/level2",
  auth.authenticate,
  (req, res) => {
    res.render("level2", {
      username: req.session.userId,
      level: 2
    });
  }
);


// -----------------------------------
// 6. ADMIN ROUTES
// -----------------------------------

// Display admin dashboard
app.get(
    "/admin",
    auth.authenticate,
    auth.requireAdmin,
    (req, res) => {
        res.render("admin", {
            username: req.session.userId
        });
    }
);

// Get all registered users
app.get(
    "/users",
    auth.authenticate,
    auth.requireAdmin,
    auth.users
);

// Delete a registered user
app.delete(
    "/api/admin/users/:userid",
    auth.authenticate,
    auth.requireAdmin,
    (req, res, next) => {
        const origin = req.get("Origin");
        const expectedOrigin =
            `${req.protocol}://${req.get("host")}`;

        if (origin !== expectedOrigin) {
            return res.status(403).json({
                error: "Invalid request origin."
            });
        }

        next();
    },
    auth.deleteUser
);





//
// -----------------------------------
// 9. LEADERBOARD ROUTES
// -----------------------------------

// Display leaderboard page
app.get("/leaderboard", (req, res) => {
  res.render("leaderboard");
});

// Save a player's completion time
app.post(
  "/api/scores",
  auth.authenticate,
  leaderboard.saveScore
);

// Get rankings for Level 1 or Level 2
app.get(
  "/api/leaderboard/:level",
  leaderboard.getLeaderboard
);

// Get the logged-in player's best scores
app.get(
  "/api/my-scores",
  auth.authenticate,
  leaderboard.getMyScores
);



// -----------------------------------
// 9. ERROR HANDLING
// -----------------------------------

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

app.use((err, req, res, next) => {
  console.error("Application error:", err);

  res.status(500).send(
    "Something went wrong."
  );
});

// -----------------------------------
// 10. START SERVER
// -----------------------------------

app.listen(PORT, () => {
  console.log("WordQuest server started!");
  console.log(`Home: http://localhost:${PORT}`);
  console.log(`Login: http://localhost:${PORT}/login`);
  console.log(`Register: http://localhost:${PORT}/title`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});
