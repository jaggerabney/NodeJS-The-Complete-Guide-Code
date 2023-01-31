const fs = require("fs");
const path = require("path");
const { uuid } = require("uuidv4");

const rootDir = require("../util/path");

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
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
    const productsFilePath = path.join(rootDir, "data", "products.json");

    fs.readFile(productsFilePath, (error, content) => {
      return error ? callback([]) : callback(JSON.parse(content));
    });
  }
};
