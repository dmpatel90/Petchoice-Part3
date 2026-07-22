"use strict";

require("dotenv").config();

const express = require("express");
const sequelize = require("./config/database");

const app = express();

const PORT = process.env.PORT || 5500;

sequelize.authenticate()

.then(() => {

    console.log("✅ Connected to Neon PostgreSQL");

    app.listen(PORT, () => {

        console.log(`Server running on port ${PORT}`);

    });

})

.catch(err => {

    console.log(err);

});

sequelize.sync()
    .then(() => {
        console.log("✅ Database synchronized");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(err);
    });