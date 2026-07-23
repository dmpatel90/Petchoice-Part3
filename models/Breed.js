"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Breed = sequelize.define(
  "Breed",
  {
    breed_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
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
    coat_type: {
      type: DataTypes.STRING
    },
    grooming_level: {
      type: DataTypes.STRING
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    }
  },
  {
    tableName: "breeds",
    timestamps: false
  }
);

module.exports = Breed;