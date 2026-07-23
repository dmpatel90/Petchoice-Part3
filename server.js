"use strict";

require("dotenv").config();

const express = require("express");
const sequelize = require("./config/database");
const Breed = require("./models/Breed");

const app = express();
const PORT = process.env.PORT || 5500;

//GET /breeds - Retrieve all breeds
app.get("/breeds", async (req, res) => {
  try {
    const breeds = await Breed.findAll();
    res.json(breeds);
  } catch (error) {
    res.status(500).send("Error fetching breeds");
  }
});

//GET /breeds/:id - Retrieve a breed by ID
app.get("/breeds/:id", async (req, res) => {
  try {
    const breed = await Breed.findByPk(req.params.id);

    if (!breed) {
      return res.status(404).send("Breed not found");
    }

    res.json(breed);
  } catch (error) {
    res.status(500).send("Error fetching breed");
  }
});

//GET /breeds/search?name= - Search breeds by name
app.get("/search", async (req, res) => {
  try {
    const origin = req.query.origin;

    const breeds = await Breed.findAll({
      where: { origin }
    });

    res.json(breeds);
  } catch (error) {
    res.status(500).send("Error searching breeds");
  }
});

sequelize.authenticate()
  .then(async () => {
    console.log("✅ Connected to Neon PostgreSQL");

    await sequelize.sync();
    console.log("✅ Database synchronized");

    const breeds = await Breed.findAll();

    console.log(`Total breeds: ${breeds.length}`);
    console.log(breeds[0]?.toJSON());

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });