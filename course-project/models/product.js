const fs = require("fs");
const path = require("path");
const { uuid } = require("uuidv4");

const rootDir = require("../util/path");

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = Number(price);
    this.id = uuid();
  }

  save() {
    const productsFilePath = path.join(rootDir, "data", "products.json");

    fs.readFile(productsFilePath, (error, content) => {
      const products = error ? [] : JSON.parse(content);

      products.push(this);

      fs.writeFile(productsFilePath, JSON.stringify(products), (error) => {
        // do nothing
      });
    });
  }

  static fetchAll(callback) {
    this.readProductsFile((products) => callback(JSON.parse(products)));
  }

  static findById(productId, callback) {
    this.fetchAll((products) => {
      const product = products.find((element) => productId === element.id);
      callback(product);
    });
  }

  static readProductsFile(callback) {
    const productsFilePath = path.join(rootDir, "data", "products.json");

    fs.readFile(productsFilePath, (error, content) => {
      callback(content);
    });
  }
};
