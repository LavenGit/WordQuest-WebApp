# 🧩 WordQuest

### 🎮 Unscramble. Discover. Win.

**A full-stack word puzzle web application built with Node.js, Express.js, Handlebars, and SQLite.**

WordQuest challenges players to solve scrambled words, beat the clock, and compete on a leaderboard. It includes secure user authentication, multiple difficulty levels, score tracking, and an administrator dashboard.

**Tech Stack:** JavaScript • Node.js • Express.js • Handlebars • SQLite • HTML • CSS

---

## ✨ Features

### 🔐 Authentication
- User registration, login, and logout
- Session-based authentication
- Protected game pages and user accounts

### 🎯 Interactive Gameplay
- 🟢 **Level 1:** Beginner word puzzles
- 🟠 **Level 2:** Intermediate word puzzles
- ⏱️ Live timer and progress tracking
- 🔄 Restart challenges to improve completion times
- 👤 Display the currently logged-in player

### 🏆 Leaderboard
- Save completion times in SQLite
- View rankings for each level
- Track personal best scores

### 🛡️ Admin Dashboard
- View registered users
- Manage and delete user accounts
- Role-based access control

-------------------------

## 🚀 Getting Started

### 1️⃣ Clone the Repository

**git clone https://github.com/LavenGit/WordQuest-WebApp.git**

**cd WordQuest-WebApp**

Alternatively, download the ZIP file from GitHub and extract it.

### 2️⃣ Install Dependencies

**npm ci**

### 3️⃣ Configure the Session Secret

Generate a secure random secret:

`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Copy the generated value and set it in your terminal.

**Windows PowerShell**

`$env:SESSION_SECRET = "YOUR_GENERATED_SECRET"`

**Windows CMD**

`set SESSION_SECRET=YOUR_GENERATED_SECRET`

**macOS / Linux**

`export SESSION_SECRET="YOUR_GENERATED_SECRET"`

Replace `YOUR_GENERATED_SECRET` with the generated value.

### 4️⃣ Initialize the Database

**node database.js**

Ensure the initialization process creates the required user and leaderboard tables.

### 5️⃣ Start the Application

**node app.js**

🌐 Open **http://localhost:3000**

---

## 🎮 How to Play

1. 📝 **Register** a new account.
2. 🔑 **Log in** using your credentials.
3. 🧩 **Play Level 1** and solve the scrambled words.
4. 🚀 **Unlock the next challenge** by continuing to Level 2.
5. 🏆 **Check the leaderboard** to compare completion times.
6. 🚪 **Log out** when finished.

### 👥 Switching Players

Want to play as someone else?

Click **Logout** on the game page, then log in using another registered account. New players can register first.

**No server restart is required.**

---

## 👑 Administrator Setup

**1. Register a user** through the WordQuest application.

**2. Open a second terminal** in the project directory. Keep `node app.js` running in the first terminal.

**3. Promote the user:**

`node make-admin.js TestAdmin`

Replace `TestAdmin` with the registered username.

**4. Log out and log back in**, then visit:

http://localhost:3000/admin

Only trusted administrators should run the admin setup script.

---

## 🔗 Application Pages

| Page | Route | Description |
|---|---|---|
| 📝 Registration | `/title` | Create a new account |
| 🔑 Login | `/login` | Log in to WordQuest |
| 🧩 Level 1 | `/newpage` | Beginner word puzzles |
| 🚀 Level 2 | `/level2` | Intermediate word puzzles |
| 🏆 Leaderboard | `/leaderboard` | View player rankings |
| 🛡️ Admin Dashboard | `/admin` | Manage registered users |z

---

## 🔒 Security

WordQuest uses SQLite for storing user accounts and leaderboard scores, along with session-based authentication and role-based access control.

The following local files are excluded from GitHub:

- `Security` — User and leaderboard database
- `sessions.sqlite` — Session storage
- `.env` — Environment configuration
- `node_modules/` — Installed dependencies

**Never upload session secrets or private user information to a public repository.**

---

## 🔮 Future Improvements

- 🎯 More puzzle levels and difficulty options
- 💡 Hint system
- 🏅 Player achievements and statistics
- 🧪 Automated testing
- 🌐 Online deployment

---

## 👨‍💻 Author

**Laven Joshi**

🔗 [GitHub Profile](https://github.com/LavenGit)

📂 [WordQuest Repository](https://github.com/LavenGit/WordQuest-WebApp)

---

⭐ **If you enjoyed exploring WordQuest, consider starring the repository!**
