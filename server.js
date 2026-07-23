// server.js — PetChoice Part 3
// Express application connected to Neon PostgreSQL via Sequelize.
// Replaces the local breeds.json data source from Part 2.

require("dotenv").config();
const express = require("express");
const path = require("path");
const sequelize = require("./config/database");

// Route modules
const apiRoutes = require("./routes/api");
const breedRoutes = require("./routes/breeds");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────

// Home page
app.get("/", async (req, res) => {
  try {
    const Breed = require("./models/Breed");
    const count = await Breed.count();
    res.render("index", { total: count });
  } catch {
    res.render("index", { total: "—" });
  }
});

// API / JSON routes  →  /api/...
app.use("/api", apiRoutes);

// HTML / EJS routes  →  /breeds/...
app.use("/breeds", breedRoutes);

// 404 catch-all
app.use((req, res) => {
  res.status(404).render("404", {
    message: "The page you are looking for does not exist.",
  });
});

// Global error handler — never expose stack traces to users
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).render("error", {
    message: "Something went wrong on the server. Please try again.",
  });
});

// ── Start server after confirming DB connection ───────────────────────────
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to Neon PostgreSQL.");
    app.listen(PORT, () => {
      console.log(`PetChoice server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    console.error("Check your DATABASE_URL in the .env file.");
    process.exit(1);
  });
