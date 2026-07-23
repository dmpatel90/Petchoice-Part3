// models/Breed.js
// Sequelize model for the "breeds" PostgreSQL table.
//
// JSON → PostgreSQL field mapping:
//   id (string)           → breed_id (VARCHAR, PK)
//   name                  → name (VARCHAR NOT NULL, UNIQUE)
//   origin                → origin (VARCHAR NOT NULL)
//   temperament           → temperament (TEXT NOT NULL)
//   description           → description (TEXT NOT NULL)
//   image_url             → image_url (TEXT)
//   details.lifespan      → lifespan (VARCHAR)      ← flattened from nested object
//   details.weight        → weight (VARCHAR)         ← flattened from nested object
//   details.coatType      → coat_type (VARCHAR)      ← flattened from nested object
//   details.groomingLevel → grooming_level (VARCHAR) ← flattened from nested object
//   tags (array)          → tags (JSONB)             ← stored as JSONB array

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Breed = sequelize.define(
  "Breed",
  {
    breed_id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Breed ID cannot be empty." },
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Breed name is required." },
        len: { args: [2, 100], msg: "Name must be between 2 and 100 characters." },
      },
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Origin country is required." },
      },
    },
    temperament: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Temperament is required." },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Description is required." },
        len: { args: [10, 2000], msg: "Description must be between 10 and 2000 characters." },
      },
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    lifespan: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    weight: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    coat_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    grooming_level: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: {
          args: [["Low", "Medium", "High", null]],
          msg: "Grooming level must be Low, Medium, or High.",
        },
      },
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "breeds",
    timestamps: false, // No createdAt/updatedAt columns needed
  }
);

module.exports = Breed;
