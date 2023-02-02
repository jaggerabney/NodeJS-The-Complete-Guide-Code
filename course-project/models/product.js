const { uuid } = require("uuidv4");

const db = require("../util/database");

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = Number(price);
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(productId) {
    // return db.execute("SELECT * FROM products WHERE ")
  }

  static deleteProductById(productId) {}

  save() {}
};
