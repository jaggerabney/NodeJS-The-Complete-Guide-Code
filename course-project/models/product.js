const mongodb = require("mongodb");
const db = require("../util/database").getDb;

class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db().collection("products").insertOne(this);
  }

  static fetchAll() {
    return db()
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((error) => console.log(error));
  }

  static findById(productId) {
    return db()
      .collection("products")
      .find({ _id: new mongodb.ObjectId(productId) })
      .next()
      .then((product) => {
        return product;
      })
      .catch((error) => console.log(error));
  }
}

module.exports = Product;
