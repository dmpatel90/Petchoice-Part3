require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const {

    requireLogin,

    requireAdmin

} = require("./routes/auth");
const { Op } = require("sequelize");

const { sequelize, Breed, user : User } = require("./models");

const app = express();
console.log("SERVER VERSION 2");

const PORT = process.env.PORT || 5500;

// =====================================
// Middleware
// =====================================

// Security Headers
app.use(
  helmet({
       contentSecurityPolicy: false,
       crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
       crossOriginResourcePolicy: false,
     originAgentCluster: false
   })
);

// Parse Form Data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
    session({
        secret: process.env.SESSION_SECRET || "petchoice-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 // 1 Hour
        }
    })
);

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Logged-in User Available Everywhere
app.use((req, res, next) => {

    res.locals.user = req.session.user || null;

    next();

});

// Current Request Available in Views
app.use((req, res, next) => {

    res.locals.req = req;

    next();

});

// =====================================
// Home
// =====================================

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

// =====================================
// About
// =====================================

app.get("/about", (req, res) => {

    res.render("about", {

        title: "About"

    });

});

// =====================================
// Browse Breeds
// =====================================

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

app.get("/breeds/add", requireAdmin, (req, res) => {

    res.render("breedAdd", {

        title: "Add Breed"

    });

});

app.post("/breeds/add", requireAdmin, async (req, res) => {

    try {

        // Validation

        if (

            !req.body.id ||
            !req.body.name ||
            !req.body.origin ||
            !req.body.temperament ||
            !req.body.description ||
            !req.body.imageUrl ||
            !req.body.lifespan ||
            !req.body.weight ||
            !req.body.coatType

        ) {

            return res.status(400).render("error", {

                title: "Validation Error",

                message: "Please fill in all required fields."

            });

        }

        // Prevent duplicate IDs

        const existingBreed = await Breed.findByPk(req.body.id);

        if (existingBreed) {

            return res.status(400).render("error", {

                title: "Duplicate Breed",

                message: "A breed with this ID already exists."

            });

        }

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
                ? req.body.tags.split(",").map(tag => tag.trim())
                : []

        });

        res.redirect("/breeds");

    } catch (err) {

        res.status(500).render("error", {

            title: "Error",

            message: err.message

        });

    }

});
// =====================================
// Breed Details
// =====================================

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

app.get("/breeds/:id/edit",requireAdmin, async (req, res) => {

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

    } catch (err) {

        res.status(500).render("error", {

            title: "Error",
            message: err.message

        });

    }

});

app.post("/breeds/:id/edit", requireAdmin, async (req, res) => {

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
                ? req.body.tags.split(",").map(tag => tag.trim())
                : []

        }, {

            where: {

                id: req.params.id

            }

        });

        res.redirect(`/breeds/${req.params.id}`);

    } catch (err) {

        res.status(500).render("error", {

            title: "Error",
            message: err.message

        });

    }

});

// =====================================
// Delete Breed
// =====================================

app.post("/breeds/:id/delete", requireAdmin, async (req, res) => {

    try {

        const breed = await Breed.findByPk(req.params.id);

        if (!breed) {

            return res.status(404).render("error", {

                title: "Not Found",
                message: "Breed not found."

            });

        }

        await breed.destroy();

        res.redirect("/breeds");

    } catch (err) {

        res.status(500).render("error", {

            title: "Error",
            message: err.message

        });

    }

});

// =====================================
// Search
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
                    },

                    {
                        temperament: {
                            [Op.iLike]: `%${search}%`
                        }
                    },

                    {
                        coatType: {
                            [Op.iLike]: `%${search}%`
                        }
                    },

                    {
                        groomingLevel: {
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

    } catch (err) {

        res.status(500).render("error", {

            title: "Error",
            message: err.message

        });

    }

});

// =====================================
// REST API - All Breeds
// =====================================

app.get("/api/breeds", async (req, res) => {

    try {

        const breeds = await Breed.findAll({

            order: [["name", "ASC"]]

        });

        res.json(breeds);

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// =====================================
// REST API - Single Breed
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

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

// =====================================
// API Health
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

    } catch (err) {

        res.status(500).json({

            status: "ERROR",
            database: "Disconnected",
            message: err.message

        });

    }

});
// =====================================
//login  
// =====================================
app.get("/login", (req, res) => {

    res.render("login", {

        title: "Login"

    });

});

//=====================================
//login post
//=====================================

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Find user by email
        const dbUser = await User.findOne({
            where: { email }
        });

        if (!dbUser) {

            return res.render("login", {
                title: "Login",
                error: "Invalid email or password."
            });

        }

        // Compare password
        const validPassword = await bcrypt.compare(
            password,
            dbUser.password
        );

        if (!validPassword) {

            return res.render("login", {
                title: "Login",
                error: "Invalid email or password."
            });

        }

        // Create session
        req.session.user = {

            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role

        };

        return res.redirect("/");

    } catch (err) {

        console.error("LOGIN ERROR:", err);

        return res.status(500).render("error", {
            title: "Error",
            message: err.message
        });

    }

});
// =====================================
// Logout
// =====================================

app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/login");

    });

});

// =====================================
// 404
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

/// =====================================
// Initialize Database
// =====================================

async function initialize() {

    try {

        await sequelize.authenticate();

        console.log("✅ Connected to Neon PostgreSQL");

        await sequelize.sync();

        console.log("✅ Database synchronized");

    } catch (err) {

        console.error("❌ Database initialization failed");

        console.error(err);

    }

}

initialize();

// Export app for Vercel
module.exports = app;

// Start local server only when NOT running on Vercel
if (!process.env.VERCEL) {

    app.listen(PORT, () => {

        console.log(`🚀 Server running on http://localhost:${PORT}`);

    });

}