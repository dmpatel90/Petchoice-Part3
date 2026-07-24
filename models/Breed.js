const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Breed = sequelize.define(
  "Breed",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },

    temperament: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "image_url"
    },

    lifespan: {
      type: DataTypes.STRING,
      allowNull: false
    },

    weight: {
      type: DataTypes.STRING,
      allowNull: false
    },

    coatType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "coat_type"
    },

    groomingLevel: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "grooming_level"
    },

    tags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    }
  },
  {
    tableName: "breeds",
    timestamps: false
  }
);

module.exports = Breed;