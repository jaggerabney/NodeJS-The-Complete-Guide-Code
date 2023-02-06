const { v4 } = require("uuid");

const db = require("../util/database").getDb;

class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this.id = v4();
  }

  save() {
    return db().collection("products").insertOne(this);
  }
}

module.exports = Product;
