const sequelize = require("../config/database");
const Breed = require("./Breed");
const User = require("./User");

module.exports = {
    sequelize,
    Breed,
    User
};