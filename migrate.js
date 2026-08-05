// One-time schema migration.
//
// The Register and Forgot Password features added new columns to the
// "users" table (phone, reset_otp_hash, reset_otp_expires_at). The app's
// normal startup (server.js) only runs sequelize.sync(), which creates
// tables that don't exist yet but will NOT alter a table that's already
// there — so the existing Neon "users" table needs to be brought up to
// date once, manually, by running this script:
//
//     npm run migrate
//
// This only needs to be run once per database (e.g. once against your
// Neon database). It's safe to run again later too — it won't touch
// existing data, it just adds any columns that are missing.

require("dotenv").config();

const { sequelize } = require("./models");

async function migrate() {

    try {

        console.log("Connecting to database...");

        await sequelize.authenticate();

        console.log("Connected. Syncing schema (alter mode)...");

        await sequelize.sync({ alter: true });

        console.log("✅ Schema is up to date — phone / reset OTP columns are ready.");

    } catch (err) {

        console.error("❌ Migration failed:", err);
        process.exitCode = 1;

    } finally {

        await sequelize.close();

    }

}

migrate();
