"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Breed = sequelize.define("Breed", {

    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    origin: {
        type: DataTypes.STRING
    },

    temperament: {
        type: DataTypes.TEXT
    },

    description: {
        type: DataTypes.TEXT
    },

    image_url: {
        type: DataTypes.TEXT
    },

    lifespan: {
        type: DataTypes.STRING
    },

    weight: {
        type: DataTypes.STRING
    },

    coatType: {
        type: DataTypes.STRING
    },

    groomingLevel: {
        type: DataTypes.STRING
    }

}, {

    tableName: "breeds",
    timestamps: false

});

module.exports = Breed;