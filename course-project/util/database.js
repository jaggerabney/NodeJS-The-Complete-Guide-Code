const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
require("dotenv").config();

function mongoConnect(callback) {
  MongoClient.connect(process.env.DB_CONNECTION_STRING)
    .then((result) => {
      console.log("Connected!");

      callback(result);
    })
    .catch((error) => console.log(error));
}

module.exports = mongoConnect;
