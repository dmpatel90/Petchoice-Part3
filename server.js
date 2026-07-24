require("dotenv").config();

const express = require("express");
const path = require("path");
const { Op } = require("sequelize");

const { sequelize, Breed } = require("./models");

const app = express();

const PORT = process.env.PORT || 5500;

// -----------------------------
// Middleware
// -----------------------------

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Make query string available in every EJS page
app.use((req, res, next) => {
    res.locals.req = req;
    next();
});

app.get("/", async (req, res) => {

    try {

        const total = await Breed.count();

        res.render("index", {
            title: "Home",
            total
        });

    } catch (err) {

        res.status(500).render("error", {
            title: "Error",
            message: err.message
        });

    }

});

app.get("/breeds", async (req, res) => {

    try {

        const breeds = await Breed.findAll({

            order: [["name", "ASC"]]

        });

        res.render("breeds", {

            title: "All Breeds",

            breeds

        });

    } catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});

// =====================================
// Add Breed
// =====================================

app.get("/breeds/add", (req, res) => {

    res.render("breedAdd", {

        title: "Add Breed"

    });

});


app.post("/breeds/add", async (req, res) => {

    try {

        await Breed.create({

            id: req.body.id,

            name: req.body.name,

            origin: req.body.origin,

            temperament: req.body.temperament,

            description: req.body.description,

            imageUrl: req.body.imageUrl,

            lifespan: req.body.lifespan,

            weight: req.body.weight,

            coatType: req.body.coatType,

            groomingLevel: req.body.groomingLevel,

            tags: req.body.tags
                ? req.body.tags
                      .split(",")
                      .map(tag => tag.trim())
                : []

        });

        res.redirect("/breeds");

    }

    catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});

app.get("/breeds/:id", async (req, res) => {

    try {

        const breed = await Breed.findByPk(req.params.id);

        if (!breed) {

            return res.status(404).render("error", {

                title: "Not Found",

                message: "Breed not found."

            });

        }

        res.render("breedDetails", {

            title: breed.name,

            breed

        });

    } catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});

// =====================================
// Edit Breed
// =====================================

app.get("/breeds/:id/edit", async (req, res) => {

    try {

        const breed = await Breed.findByPk(req.params.id);

        if (!breed) {

            return res.status(404).render("error", {

                title: "Not Found",

                message: "Breed not found."

            });

        }

        res.render("breedEdit", {

            title: "Edit Breed",

            breed

        });

    }

    catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});

app.post("/breeds/:id/edit", async (req, res) => {

    try {

        await Breed.update({

            name: req.body.name,

            origin: req.body.origin,

            temperament: req.body.temperament,

            description: req.body.description,

            imageUrl: req.body.imageUrl,

            lifespan: req.body.lifespan,

            weight: req.body.weight,

            coatType: req.body.coatType,

            groomingLevel: req.body.groomingLevel,

            tags: req.body.tags
                ? req.body.tags
                      .split(",")
                      .map(tag => tag.trim())
                : []

        },

        {

            where: {

                id: req.params.id

            }

        });

        res.redirect(`/breeds/${req.params.id}`);

    }

    catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});

// =====================================
// Search Breeds
// =====================================

app.get("/search", async (req, res) => {

    try {

        const search = req.query.q;

        if (!search) {

            return res.render("search", {
                title: "Search",
                breeds: []
            });

        }

        const breeds = await Breed.findAll({

            where: {

                [Op.or]: [

                    {
                        name: {
                            [Op.iLike]: `%${search}%`
                        }
                    },

                    {
                        origin: {
                            [Op.iLike]: `%${search}%`
                        }
                    }

                ]

            },

            order: [["name", "ASC"]]

        });

        res.render("search", {

            title: "Search",

            breeds

        });

    }

    catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});

// =====================================
// Delete Breed
// =====================================

app.post("/breeds/:id/delete", async (req, res) => {

    try {

        await Breed.destroy({

            where: {

                id: req.params.id

            }

        });

        res.redirect("/breeds");

    }

    catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});

// =====================================
// REST API - Get All Breeds
// =====================================

app.get("/api/breeds", async (req, res) => {

    try {

        const breeds = await Breed.findAll({

            order: [["name", "ASC"]]

        });

        res.json(breeds);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});


// =====================================
// REST API - Get One Breed
// =====================================

app.get("/api/breeds/:id", async (req, res) => {

    try {

        const breed = await Breed.findByPk(req.params.id);

        if (!breed) {

            return res.status(404).json({

                error: "Breed not found"

            });

        }

        res.json(breed);

    }

    catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});


// =====================================
// API Health Check
// =====================================

app.get("/api/health", async (req, res) => {

    try {

        await sequelize.authenticate();

        const total = await Breed.count();

        res.json({

            status: "OK",

            database: "Connected",

            breeds: total,

            timestamp: new Date()

        });

    }

    catch (err) {

        res.status(500).json({

            status: "ERROR",

            database: "Disconnected",

            message: err.message

        });

    }

});


// =====================================
// 404 Handler
// =====================================

app.use((req, res) => {

    res.status(404).render("error", {

        title: "404",

        message: "The page you requested could not be found."

    });

});


// =====================================
// Global Error Handler
// =====================================

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).render("error", {

        title: "Server Error",

        message: err.message

    });

});


// =====================================
// Start Server
// =====================================

async function startServer() {

    try {

        await sequelize.authenticate();

        console.log("✅ Connected to Neon PostgreSQL");

        await sequelize.sync();

        app.listen(PORT, () => {

            console.log(`🚀 Server running on http://localhost:${PORT}`);

        });

    }

    catch (err) {

        console.error("❌ Failed to start application");

        console.error(err);

    }

}

startServer();