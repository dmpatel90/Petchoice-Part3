require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const pgSessionStore = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const crypto = require("crypto");
const { sendOtpEmail } = require("./lib/mailer");
const {

    requireLogin,

    requireAdmin

} = require("./routes/auth");
const { Op } = require("sequelize");

const { sequelize, Breed, user : User } = require("./models");

// Same session check as requireLogin, but responds with JSON instead of
// redirecting — used for the REST API routes.
function requireLoginApi(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({

            error: "Authentication required."

        });

    }

    next();

}

// Forgot Password OTP settings
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp() {

    return String(crypto.randomInt(100000, 999999));

}

// Logs the real error server-side, but only ever shows the user a
// generic message — avoids leaking internal details (DB errors, stack
// traces, connection strings, etc.) through the UI.
function serverError(res, err, context) {

    console.error(`${context}:`, err);

    return res.status(500).render("error", {

        title: "Server Error",
        message: "Something went wrong on our end. Please try again in a moment."

    });

}

function apiServerError(res, err, context) {

    console.error(`${context}:`, err);

    return res.status(500).json({

        error: "Something went wrong on our end. Please try again in a moment."

    });

}

// Session store — a dedicated pg Pool (same SSL settings as config/database.js)
// so express-session persists to Postgres instead of process memory. This
// matters on Vercel: the default MemoryStore doesn't survive serverless
// cold starts, so logged-in sessions can silently disappear.
const sessionPool = new Pool({

    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }

});

// Rate limiting — blunts brute-force / spam attempts on auth endpoints
// without getting in the way of normal use.
const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {

        res.status(429).render("error", {

            title: "Too Many Attempts",
            message: "Too many attempts from this device. Please wait a few minutes and try again."

        });

    }

});

const otpLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {

        res.status(429).render("error", {

            title: "Too Many Attempts",
            message: "Too many attempts from this device. Please wait a few minutes and try again."

        });

    }

});

const app = express();
console.log("SERVER VERSION 2");

const PORT = process.env.PORT || 5500;

// =====================================
// Middleware
// =====================================

// Security Headers
app.use(
    helmet({

        // A working policy instead of `false` — allows the Google Fonts /
        // Bootstrap CDN this app loads and the inline breeds-filter
        // script, while still turning on Helmet's other protections
        // (object-src 'none', base-uri 'self', etc). Breed images can be
        // hosted anywhere (the Add Breed form takes any URL), so img-src
        // allows any https source.
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                objectSrc: ["'none'"],
                baseUri: ["'self'"]
            }
        },

        // Left off on purpose: COEP/COOP require every cross-origin
        // resource (Google Fonts, jsDelivr) to send matching CORP/CORS
        // headers. Enabling them without being able to live-test risks
        // silently breaking fonts or Bootstrap during the demo.
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,

        crossOriginResourcePolicy: { policy: "cross-origin" },
        originAgentCluster: true

    })
);

// Parse Form Data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions — stored in Postgres (not the default in-memory store) so
// logins survive Vercel serverless cold starts. Uses the "session" table,
// auto-created on first run.
app.use(
    session({
        store: new pgSessionStore({
            pool: sessionPool,
            tableName: "session",
            createTableIfMissing: true
        }),
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

// CSRF Protection — a session-bound token issued to every visitor, and
// checked on every state-changing request. Simpler and actively
// maintained compared to the (deprecated) csurf package.
app.use((req, res, next) => {

    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString("hex");
    }

    res.locals.csrfToken = req.session.csrfToken;

    next();

});

app.use((req, res, next) => {

    const safeMethods = ["GET", "HEAD", "OPTIONS"];

    if (safeMethods.includes(req.method)) {
        return next();
    }

    const submittedToken = req.body && req.body._csrf;

    if (!submittedToken || submittedToken !== req.session.csrfToken) {

        return res.status(403).render("error", {

            title: "Forbidden",
            message: "Your form session expired or could not be verified. Please go back and try again."

        });

    }

    next();

});

// =====================================
// Home
// =====================================

app.get("/", async (req, res) => {

    try {

        const total = await Breed.count();
        const totalUsers = await User.count();

        res.render("index", {

            title: "Home",
            total,
            totalUsers

        });

    } catch (err) {

        return serverError(res, err, "HOME ERROR");

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

app.get("/breeds", requireLogin, async (req, res) => {

    try {

        const breeds = await Breed.findAll({

            order: [["name", "ASC"]]

        });

        res.render("breeds", {

            title: "All Breeds",
            breeds

        });

    } catch (err) {

        return serverError(res, err, "BREEDS LIST ERROR");

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

        return serverError(res, err, "ADD BREED ERROR");

    }

});
// =====================================
// Breed Details
// =====================================

app.get("/breeds/:id", requireLogin, async (req, res) => {

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

        return serverError(res, err, "BREED DETAILS ERROR");

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

        return serverError(res, err, "EDIT BREED FORM ERROR");

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

        return serverError(res, err, "EDIT BREED SAVE ERROR");

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

        return serverError(res, err, "DELETE BREED ERROR");

    }

});

// =====================================
// Search
// =====================================

app.get("/search", requireLogin, async (req, res) => {

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

        return serverError(res, err, "SEARCH ERROR");

    }

});

// =====================================
// REST API - All Breeds
// =====================================

app.get("/api/breeds", requireLoginApi, async (req, res) => {

    try {

        const breeds = await Breed.findAll({

            order: [["name", "ASC"]]

        });

        res.json(breeds);

    } catch (err) {

        return apiServerError(res, err, "API BREEDS LIST ERROR");

    }

});

// =====================================
// REST API - Single Breed
// =====================================

app.get("/api/breeds/:id", requireLoginApi, async (req, res) => {

    try {

        const breed = await Breed.findByPk(req.params.id);

        if (!breed) {

            return res.status(404).json({

                error: "Breed not found"

            });

        }

        res.json(breed);

    } catch (err) {

        return apiServerError(res, err, "API BREED DETAIL ERROR");

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

app.post("/login", loginLimiter, async (req, res) => {

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

        return serverError(res, err, "LOGIN ERROR");

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
// Register
// =====================================

app.get("/register", (req, res) => {

    if (req.session.user) {
        return res.redirect("/");
    }

    res.render("register", {

        title: "Register"

    });

});

app.post("/register", loginLimiter, async (req, res) => {

    try {

        const { name, email, phone, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {

            return res.render("register", {

                title: "Register",
                error: "Please fill in all required fields.",
                form: req.body

            });

        }

        if (password.length < 8) {

            return res.render("register", {

                title: "Register",
                error: "Password must be at least 8 characters long.",
                form: req.body

            });

        }

        if (password !== confirmPassword) {

            return res.render("register", {

                title: "Register",
                error: "Password and confirmation do not match.",
                form: req.body

            });

        }

        const existingEmail = await User.findOne({ where: { email } });

        if (existingEmail) {

            return res.render("register", {

                title: "Register",
                error: "An account with this email already exists.",
                form: req.body

            });

        }

        if (phone) {

            const existingPhone = await User.findOne({ where: { phone } });

            if (existingPhone) {

                return res.render("register", {

                    title: "Register",
                    error: "An account with this phone number already exists.",
                    form: req.body

                });

            }

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({

            name,
            email,
            phone: phone || null,
            password: hashedPassword,
            role: "viewer"

        });

        // Auto sign-in after registration
        req.session.user = {

            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role

        };

        return res.redirect("/");

    } catch (err) {

        return serverError(res, err, "REGISTER ERROR");

    }

});

// =====================================
// Forgot Password — Step 1: Request a code
// =====================================

app.get("/forgot-password", (req, res) => {

    res.render("forgotPassword", {

        title: "Forgot Password"

    });

});

app.post("/forgot-password", otpLimiter, async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.render("forgotPassword", {

                title: "Forgot Password",
                error: "Please enter the email on your account."

            });

        }

        const dbUser = await User.findOne({ where: { email } });

        // Don't reveal whether the email exists — same message either way.
        if (!dbUser) {

            return res.render("forgotPassword", {

                title: "Forgot Password",
                error: "If that email is registered, a verification code has been sent."

            });

        }

        const code = generateOtp();
        const codeHash = await bcrypt.hash(code, 10);

        await User.update(

            {
                resetOtpHash: codeHash,
                resetOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS)
            },
            { where: { id: dbUser.id } }

        );

        req.session.resetEmail = dbUser.email;

        // Always logged server-side as a safety net for the demo.
        console.log(`🔐 Password reset OTP for ${dbUser.email}: ${code}`);

        const emailed = await sendOtpEmail(dbUser.email, code);

        return res.render("verifyOtp", {

            title: "Verify Code",
            email: dbUser.email,
            emailed,
            demoCode: code

        });

    } catch (err) {

        return serverError(res, err, "FORGOT PASSWORD ERROR");

    }

});

// =====================================
// Forgot Password — Step 2: Verify the code
// =====================================

app.post("/verify-otp", otpLimiter, async (req, res) => {

    try {

        const { code } = req.body;
        const email = req.session.resetEmail;

        if (!email) {
            return res.redirect("/forgot-password");
        }

        if (!code) {

            return res.render("verifyOtp", {

                title: "Verify Code",
                email,
                error: "Please enter the code."

            });

        }

        const dbUser = await User.findOne({ where: { email } });

        if (!dbUser || !dbUser.resetOtpHash || !dbUser.resetOtpExpiresAt) {

            return res.render("forgotPassword", {

                title: "Forgot Password",
                error: "That code has expired. Please request a new one."

            });

        }

        if (new Date() > new Date(dbUser.resetOtpExpiresAt)) {

            return res.render("forgotPassword", {

                title: "Forgot Password",
                error: "That code has expired. Please request a new one."

            });

        }

        const validCode = await bcrypt.compare(code, dbUser.resetOtpHash);

        if (!validCode) {

            return res.render("verifyOtp", {

                title: "Verify Code",
                email,
                error: "Incorrect code. Please try again."

            });

        }

        req.session.resetVerified = true;

        return res.redirect("/reset-password");

    } catch (err) {

        return serverError(res, err, "VERIFY OTP ERROR");

    }

});

// =====================================
// Forgot Password — Step 3: Set a new password
// =====================================

app.get("/reset-password", (req, res) => {

    if (!req.session.resetVerified || !req.session.resetEmail) {
        return res.redirect("/forgot-password");
    }

    res.render("resetPassword", {

        title: "Reset Password"

    });

});

app.post("/reset-password", async (req, res) => {

    try {

        if (!req.session.resetVerified || !req.session.resetEmail) {
            return res.redirect("/forgot-password");
        }

        const { newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword) {

            return res.render("resetPassword", {

                title: "Reset Password",
                error: "Please fill in all fields."

            });

        }

        if (newPassword.length < 8) {

            return res.render("resetPassword", {

                title: "Reset Password",
                error: "New password must be at least 8 characters long."

            });

        }

        if (newPassword !== confirmPassword) {

            return res.render("resetPassword", {

                title: "Reset Password",
                error: "New password and confirmation do not match."

            });

        }

        const dbUser = await User.findOne({ where: { email: req.session.resetEmail } });

        if (!dbUser) {
            return res.redirect("/forgot-password");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.update(

            {
                password: hashedPassword,
                resetOtpHash: null,
                resetOtpExpiresAt: null
            },
            { where: { id: dbUser.id } }

        );

        delete req.session.resetEmail;
        delete req.session.resetVerified;

        return res.render("login", {

            title: "Login",
            success: "Your password has been reset. Please log in."

        });

    } catch (err) {

        return serverError(res, err, "RESET PASSWORD ERROR");

    }

});

// =====================================
// Change Password (Administrator + Viewer)
// =====================================

app.get("/change-password", requireLogin, (req, res) => {

    res.render("changePassword", {

        title: "Change Password"

    });

});

app.post("/change-password", requireLogin, async (req, res) => {

    try {

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {

            return res.render("changePassword", {

                title: "Change Password",
                error: "Please fill in all fields."

            });

        }

        if (newPassword.length < 8) {

            return res.render("changePassword", {

                title: "Change Password",
                error: "New password must be at least 8 characters long."

            });

        }

        if (newPassword !== confirmPassword) {

            return res.render("changePassword", {

                title: "Change Password",
                error: "New password and confirmation do not match."

            });

        }

        const dbUser = await User.findByPk(req.session.user.id);

        if (!dbUser) {

            return req.session.destroy(() => {

                res.redirect("/login");

            });

        }

        const validCurrent = await bcrypt.compare(currentPassword, dbUser.password);

        if (!validCurrent) {

            return res.render("changePassword", {

                title: "Change Password",
                error: "Current password is incorrect."

            });

        }

        const sameAsOld = await bcrypt.compare(newPassword, dbUser.password);

        if (sameAsOld) {

            return res.render("changePassword", {

                title: "Change Password",
                error: "New password must be different from the current password."

            });

        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.update(

            { password: hashedPassword },
            { where: { id: dbUser.id } }

        );

        return res.render("changePassword", {

            title: "Change Password",
            success: "Your password has been updated successfully."

        });

    } catch (err) {

        return serverError(res, err, "CHANGE PASSWORD ERROR");

    }

});

// =====================================
// Admin Dashboard
// =====================================

app.get("/admin/dashboard", requireAdmin, async (req, res) => {

    try {

        const totalBreeds = await Breed.count();
        const totalUsers = await User.count();
        const totalAdmins = await User.count({ where: { role: "admin" } });
        const totalViewers = await User.count({ where: { role: "viewer" } });

        const originRows = await Breed.findAll({

            attributes: [

                "origin",
                [sequelize.fn("COUNT", sequelize.col("origin")), "count"]

            ],

            group: ["origin"],
            order: [[sequelize.literal("count"), "DESC"]],
            limit: 5,
            raw: true

        });

        const recentBreeds = await Breed.findAll({

            order: [["id", "DESC"]],
            limit: 5

        });

        const users = await User.findAll({

            attributes: ["id", "name", "email", "role"],
            order: [["id", "ASC"]]

        });

        res.render("adminDashboard", {

            title: "Admin Dashboard",
            totalBreeds,
            totalUsers,
            totalAdmins,
            totalViewers,
            originRows,
            recentBreeds,
            users

        });

    } catch (err) {

        return serverError(res, err, "ADMIN DASHBOARD ERROR");

    }

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

    return serverError(res, err, "UNHANDLED ERROR");

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