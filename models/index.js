const sequelize = require("../config/database");
const Breed = require("./Breed");
const user = require("./user");

module.exports = {
    sequelize,
    Breed,
    user
};