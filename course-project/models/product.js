const mongodb = require("mongodb");
const db = require("../util/database").getDb;

class Product {
  constructor(title, imageUrl, description, price, id) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    let dbOperation;

    if (this._id) {
      dbOperation = db()
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOperation = db().collection("products").insertOne(this);
    }

    return dbOperation;
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

  static deleteById(productId) {
    return db()
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(productId) });
  }
}

module.exports = Product;
