const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
require("dotenv").config();

let db;

function mongoConnect(callback) {
  MongoClient.connect(process.env.DB_CONNECTION_STRING)
    .then((client) => {
      db = client.db();

      callback();
    })
    .catch((error) => {
      console.log(error);

      throw error;
    });
}

function getDb() {
  if (db) {
    return db;
  } else {
    throw "No database found!";
  }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
