// routes/breeds.js
// All HTML/EJS template routes — display pages for end users.
// Covers: list, detail, search, add form, update form, delete.

const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Breed = require("../models/Breed");

// Helper: generate next breed_id (e.g., breed-156)
async function nextBreedId() {
  const last = await Breed.findOne({ order: [["breed_id", "DESC"]] });
  if (!last) return "breed-001";
  const num = parseInt(last.breed_id.replace("breed-", ""), 10) || 0;
  return `breed-${String(num + 1).padStart(3, "0")}`;
}

// ── GET /breeds ──────────────────────────────────────────────────────────
// Display all breeds as a card grid.
router.get("/", async (req, res) => {
  try {
    const breeds = await Breed.findAll({ order: [["name", "ASC"]] });
    res.render("breeds", { breeds, title: "All Cat Breeds" });
  } catch (err) {
    console.error("GET /breeds error:", err.message);
    res.status(500).render("error", { message: "Could not load breeds from the database." });
  }
});

// ── GET /breeds/add ──────────────────────────────────────────────────────
// Show the insert form for adding a new breed.
// Must be BEFORE /:id so Express doesn't treat "add" as an ID.
router.get("/add", (req, res) => {
  res.render("breedAdd", {
    title: "Add New Breed",
    errors: [],
    values: {},
  });
});

// ── POST /breeds/add ─────────────────────────────────────────────────────
// Process the insert form — validate, insert into PostgreSQL, redirect.
router.post("/add", async (req, res) => {
  const values = {
    name: (req.body.name || "").trim(),
    origin: (req.body.origin || "").trim(),
    temperament: (req.body.temperament || "").trim(),
    description: (req.body.description || "").trim(),
    image_url: (req.body.image_url || "").trim() || null,
    lifespan: (req.body.lifespan || "").trim() || null,
    weight: (req.body.weight || "").trim() || null,
    coat_type: (req.body.coat_type || "").trim() || null,
    grooming_level: (req.body.grooming_level || "").trim() || null,
    tags: (req.body.tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0),
  };

  const errors = [];
  if (!values.name) errors.push("Breed name is required.");
  if (!values.origin) errors.push("Origin country is required.");
  if (!values.temperament) errors.push("Temperament is required.");
  if (!values.description || values.description.length < 10)
    errors.push("Description must be at least 10 characters.");
  if (values.grooming_level && !["Low", "Medium", "High"].includes(values.grooming_level))
    errors.push("Grooming level must be Low, Medium, or High.");

  if (errors.length > 0) {
    return res.status(422).render("breedAdd", { title: "Add New Breed", errors, values });
  }

  try {
    const breed_id = await nextBreedId();
    await Breed.create({ breed_id, ...values });
    res.redirect("/breeds?added=1");
  } catch (err) {
    // Handle unique constraint (duplicate name)
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(422).render("breedAdd", {
        title: "Add New Breed",
        errors: [`A breed named "${values.name}" already exists.`],
        values,
      });
    }
    console.error("POST /breeds/add error:", err.message);
    res.status(500).render("error", { message: "Failed to add the breed. Please try again." });
  }
});

// ── GET /breeds/search ───────────────────────────────────────────────────
// Show search form. On submission shows results inline.
router.get("/search", async (req, res) => {
  const keyword = (req.query.keyword || "").trim();
  const origin = (req.query.origin || "").trim();
  const grooming = (req.query.grooming || "").trim();

  // Get unique origins for the filter dropdown
  const allOrigins = await Breed.findAll({
    attributes: ["origin"],
    group: ["origin"],
    order: [["origin", "ASC"]],
  });
  const origins = allOrigins.map((b) => b.origin);

  if (!keyword && !origin && !grooming) {
    return res.render("search", {
      title: "Search Breeds",
      results: null,
      error: null,
      keyword: "",
      origin: "",
      grooming: "",
      origins,
    });
  }

  // Validate keyword present if nothing else given
  if (!keyword && !origin && !grooming) {
    return res.render("search", {
      title: "Search Breeds",
      results: [],
      error: "Please enter a keyword or select a filter.",
      keyword,
      origin,
      grooming,
      origins,
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
    res.render("search", {
      title: "Search Breeds",
      results,
      error: null,
      keyword,
      origin,
      grooming,
      origins,
    });
  } catch (err) {
    console.error("GET /breeds/search error:", err.message);
    res.status(500).render("error", { message: "Search failed. Please try again." });
  }
});

// ── GET /breeds/:id ──────────────────────────────────────────────────────
// Display full detail page for one breed.
router.get("/:id", async (req, res) => {
  try {
    const breed = await Breed.findByPk(req.params.id);
    if (!breed) {
      return res.status(404).render("404", {
        message: `Breed with ID "${req.params.id}" was not found.`,
      });
    }
    res.render("breedDetail", { breed, title: breed.name });
  } catch (err) {
    console.error("GET /breeds/:id error:", err.message);
    res.status(500).render("error", { message: "Could not load breed details." });
  }
});

// ── GET /breeds/:id/edit ─────────────────────────────────────────────────
// Show prepopulated update form for one breed.
router.get("/:id/edit", async (req, res) => {
  try {
    const breed = await Breed.findByPk(req.params.id);
    if (!breed) {
      return res.status(404).render("404", { message: `Breed "${req.params.id}" not found.` });
    }
    res.render("breedEdit", { title: `Edit – ${breed.name}`, breed, errors: [] });
  } catch (err) {
    console.error("GET /breeds/:id/edit error:", err.message);
    res.status(500).render("error", { message: "Could not load edit form." });
  }
});

// ── POST /breeds/:id/edit ────────────────────────────────────────────────
// Validate and update the breed record in PostgreSQL.
router.post("/:id/edit", async (req, res) => {
  try {
    const breed = await Breed.findByPk(req.params.id);
    if (!breed) {
      return res.status(404).render("404", { message: `Breed "${req.params.id}" not found.` });
    }

    const values = {
      name: (req.body.name || "").trim(),
      origin: (req.body.origin || "").trim(),
      temperament: (req.body.temperament || "").trim(),
      description: (req.body.description || "").trim(),
      image_url: (req.body.image_url || "").trim() || null,
      lifespan: (req.body.lifespan || "").trim() || null,
      weight: (req.body.weight || "").trim() || null,
      coat_type: (req.body.coat_type || "").trim() || null,
      grooming_level: (req.body.grooming_level || "").trim() || null,
      tags: (req.body.tags || "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0),
    };

    const errors = [];
    if (!values.name) errors.push("Breed name is required.");
    if (!values.origin) errors.push("Origin country is required.");
    if (!values.temperament) errors.push("Temperament is required.");
    if (!values.description || values.description.length < 10)
      errors.push("Description must be at least 10 characters.");
    if (values.grooming_level && !["Low", "Medium", "High"].includes(values.grooming_level))
      errors.push("Grooming level must be Low, Medium, or High.");

    if (errors.length > 0) {
      return res.status(422).render("breedEdit", {
        title: `Edit – ${breed.name}`,
        breed: { ...breed.toJSON(), ...values },
        errors,
      });
    }

    await breed.update(values);
    res.redirect(`/breeds/${req.params.id}?updated=1`);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      const breed = await Breed.findByPk(req.params.id);
      return res.status(422).render("breedEdit", {
        title: `Edit – ${breed.name}`,
        breed,
        errors: [`A breed named "${req.body.name}" already exists.`],
      });
    }
    console.error("POST /breeds/:id/edit error:", err.message);
    res.status(500).render("error", { message: "Failed to update the breed." });
  }
});

// ── POST /breeds/:id/delete ──────────────────────────────────────────────
// Delete a breed record from PostgreSQL. Requires confirmation token from UI.
router.post("/:id/delete", async (req, res) => {
  try {
    const breed = await Breed.findByPk(req.params.id);
    if (!breed) {
      return res.status(404).render("404", {
        message: `Breed "${req.params.id}" not found — it may have already been deleted.`,
      });
    }
    const breedName = breed.name;
    await breed.destroy();
    res.redirect(`/breeds?deleted=${encodeURIComponent(breedName)}`);
  } catch (err) {
    console.error("POST /breeds/:id/delete error:", err.message);
    res.status(500).render("error", { message: "Failed to delete the breed." });
  }
});

module.exports = router;
