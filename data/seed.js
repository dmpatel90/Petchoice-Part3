// data/seed.js
// Run once: node data/seed.js
// Reads breeds.json, transforms each record to match the PostgreSQL schema,
// and inserts all records into the Neon "breeds" table.
// Uses { force: false } — will NOT drop the table if it already has data.

require("dotenv").config();
const sequelize = require("../config/database");
const Breed = require("../models/Breed");
const rawData = require("./breeds.json");

async function seed() {
  try {
    // Sync the model — creates table if it doesn't exist, skips if it does
    await sequelize.sync({ force: false });
    console.log("Database synced.");

    // Transform JSON records → flat PostgreSQL rows
    const rows = rawData.map((b) => ({
      breed_id: b.id,
      name: b.name,
      origin: b.origin,
      temperament: b.temperament,
      description: b.description,
      image_url: b.image_url || null,
      lifespan: b.details?.lifespan || null,
      weight: b.details?.weight || null,
      coat_type: b.details?.coatType || null,
      grooming_level: b.details?.groomingLevel || null,
      tags: b.tags || [],
    }));

    // Insert all — skip duplicates (based on breed_id PK)
    let inserted = 0;
    let skipped = 0;
    for (const row of rows) {
      const [, created] = await Breed.findOrCreate({
        where: { breed_id: row.breed_id },
        defaults: row,
      });
      if (created) inserted++;
      else skipped++;
    }

    console.log(`Seed complete: ${inserted} inserted, ${skipped} already existed.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
