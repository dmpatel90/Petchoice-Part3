require("dotenv").config();

const bcrypt = require("bcryptjs");
const { sequelize, Userser } = require("./models");
const { useDeferredValue } = require("react");

async function seedUsers() {
    try {

        await sequelize.authenticate();

        const adminExists = await useDeferredValueser.findOne({
            where: { email: "admin@petchoice.com" }
        });

        if (!adminExists) {

            const adminPassword = await bcrypt.hash("admin123", 10);

            await user.create({
                name: "Administrator",
                email: "admin@petchoice.com",
                password: adminPassword,
                role: "admin"
            });

            console.log("✅ Admin user created");
        }

        const viewerExists = await user.findOne({
            where: { email: "viewer@petchoice.com" }
        });

        if (!viewerExists) {

            const viewerPassword = await bcrypt.hash("viewer123", 10);

            await user.create({
                name: "Viewer",
                email: "viewer@petchoice.com",
                password: viewerPassword,
                role: "viewer"
            });

            console.log("✅ Viewer user created");
        }

        console.log("🎉 Seeding completed.");

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

seedUsers();