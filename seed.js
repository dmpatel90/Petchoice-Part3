require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { sequelize, Breed } = require("./models");

async function seedDatabase() {

    try {

        await sequelize.authenticate();
        console.log("✅ Connected to Neon PostgreSQL");

        await sequelize.sync();

        const filePath = path.join(__dirname, "data", "breeds.json");

        const breeds = JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );

        const records = breeds.map(breed => ({

            id: breed.id,

            name: breed.name,

            origin: breed.origin,

            temperament: breed.temperament,

            description: breed.description,

            imageUrl: breed.image_url,

            lifespan: breed.details.lifespan,

            weight: breed.details.weight,

            coatType: breed.details.coatType,

            groomingLevel: breed.details.groomingLevel,

            tags: breed.tags

        }));

        await Breed.bulkCreate(records);

        console.log(`✅ Inserted ${records.length} breeds`);

        console.log("✅ Database seeding complete");

    }
    catch (err) {

        console.error(err);

    }
    finally {

        await sequelize.close();

    }

}

seedDatabase();