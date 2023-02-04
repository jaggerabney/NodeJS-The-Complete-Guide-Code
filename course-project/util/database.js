const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  "node-complete",
  "root",
  process.env.DATABASE_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
    logging: false,
  }
);

module.exports = sequelize;
