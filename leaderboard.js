
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Connect to existing SQLite database
const db = new sqlite3.Database(
    path.join(__dirname, "Security")
);

// ------------------------------------
// SAVE PLAYER'S BEST SCORE
// ------------------------------------

exports.saveScore = (req, res) => {
    const userid = req.session.userId;
    const { level, completionTime } = req.body;

    // Check if the user is logged in
    if (!userid) {
        return res.status(401).json({
            error: "You must be logged in."
        });
    }

    // Validate submitted data
    if (
        !Number.isInteger(level) ||
        ![1, 2].includes(level) ||
        !Number.isSafeInteger(completionTime) ||
        completionTime <= 0
    ) {
        return res.status(400).json({
            error: "Invalid score information."
        });
    }

    // Insert a new score or update the personal best
    const sql = `
        INSERT INTO leaderboard
            (userid, level, completion_time)
        VALUES (?, ?, ?)
        ON CONFLICT(userid, level)
        DO UPDATE SET
            completion_time = MIN(
                leaderboard.completion_time,
                excluded.completion_time
            ),
            completed_at = CASE
                WHEN excluded.completion_time <
                     leaderboard.completion_time
                THEN CURRENT_TIMESTAMP
                ELSE leaderboard.completed_at
            END
    `;

    db.run(sql, [userid, level, completionTime], function(err) {
        if (err) {
            console.error("Error saving score:", err.message);

            return res.status(500).json({
                error: "Could not save score."
            });
        }

        res.json({
            success: true,
            message: "Score saved successfully!"
        });
    });
};

// ------------------------------------
// GET TOP 10 PLAYERS
// ------------------------------------

exports.getLeaderboard = (req, res) => {
    const level = Number(req.params.level);

    if (![1, 2].includes(level)) {
        return res.status(400).json({
            error: "Invalid level."
        });
    }

    const sql = `
        SELECT userid, completion_time, completed_at
        FROM leaderboard
        WHERE level = ?
        ORDER BY completion_time ASC, userid ASC
        LIMIT 10
    `;

    db.all(sql, [level], (err, rows) => {
        if (err) {
            console.error("Leaderboard error:", err.message);

            return res.status(500).json({
                error: "Could not load leaderboard."
            });
        }

        const rankings = rows.map((player, index) => ({
            rank: index + 1,
            username: player.userid,
            time: player.completion_time,
            completedAt: player.completed_at
        }));

        res.json(rankings);
    });
};

// ------------------------------------
// GET CURRENT PLAYER'S BEST SCORES
// ------------------------------------

exports.getMyScores = (req, res) => {
    const userid = req.session.userId;

    if (!userid) {
        return res.status(401).json({
            error: "Please log in."
        });
    }

    db.all(
        `SELECT level, completion_time, completed_at
         FROM leaderboard
         WHERE userid = ?
         ORDER BY level ASC`,
        [userid],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: "Could not retrieve scores."
                });
            }

            res.json(rows);
        }
    );
};
