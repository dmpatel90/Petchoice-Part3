// routes/api.js
// All JSON/API routes — return raw data from PostgreSQL via Sequelize.

const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Breed = require("../models/Breed");

// ── GET /api/breeds ─────────────────────────────────────────────────────
// Returns all breeds as JSON, ordered by name.
router.get("/breeds", async (req, res) => {
  try {
    const breeds = await Breed.findAll({ order: [["name", "ASC"]] });
    res.json({ count: breeds.length, breeds });
  } catch (err) {
    console.error("GET /api/breeds error:", err.message);
    res.status(500).json({ error: "Failed to retrieve breeds from the database." });
  }
});

// ── GET /api/breeds/:id ─────────────────────────────────────────────────
// Returns one breed by its breed_id primary key.
router.get("/breeds/:id", async (req, res) => {
  try {
    const breed = await Breed.findByPk(req.params.id);
    if (!breed) {
      return res.status(404).json({ error: `Breed with ID "${req.params.id}" not found.` });
    }
    res.json(breed);
  } catch (err) {
    console.error("GET /api/breeds/:id error:", err.message);
    res.status(500).json({ error: "Failed to retrieve breed." });
  }
});

// ── GET /api/search?keyword=&origin=&grooming= ─────────────────────────
// Searches breeds using optional keyword, origin, and grooming_level filters.
router.get("/search", async (req, res) => {
  const keyword = (req.query.keyword || "").trim();
  const origin = (req.query.origin || "").trim();
  const grooming = (req.query.grooming || "").trim();

  if (!keyword && !origin && !grooming) {
    return res.status(400).json({
      error: "Provide at least one filter: keyword, origin, or grooming.",
    });
  }

  try {
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${keyword}%` } },
        { temperament: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }
    if (origin) where.origin = { [Op.iLike]: `%${origin}%` };
    if (grooming) where.grooming_level = grooming;

    const results = await Breed.findAll({ where, order: [["name", "ASC"]] });
    res.json({ count: results.length, keyword, origin, grooming, results });
  } catch (err) {
    console.error("GET /api/search error:", err.message);
    res.status(500).json({ error: "Search failed." });
  }
});

// ── GET /api/health ─────────────────────────────────────────────────────
// Health check — confirms the deployed app can reach Neon PostgreSQL.
router.get("/health", async (req, res) => {
  try {
    const count = await Breed.count();
    res.json({
      status: "ok",
      database: "connected",
      records: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(500).json({ status: "error", database: "unreachable", message: err.message });
  }
});

module.exports = router;
