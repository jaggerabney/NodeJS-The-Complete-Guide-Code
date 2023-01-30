const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");

module.exports = class Product {
  constructor(title) {
    this.title = title;
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
    const productsFilePath = path.join(rootDir, "data", "products.json");

    fs.readFile(productsFilePath, (error, content) => {
      return error ? callback([]) : callback(JSON.parse(content));
    });
  }
};
