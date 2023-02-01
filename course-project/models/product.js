const fs = require("fs");
const path = require("path");
const { uuid } = require("uuidv4");

const rootDir = require("../util/path");

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = Number(price);
  }

  static PRODUCTS_FILE_PATH = path.join(rootDir, "data", "products.json");

  static readProductsFile(callback) {
    fs.readFile(this.PRODUCTS_FILE_PATH, (error, content) => {
      callback(content);
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

  save() {
    const productsFilePath = path.join(rootDir, "data", "products.json");

    if (this.id) {
      Product.fetchAll((products) => {
        const existingProductIndex = products.findIndex(
          (product) => product.id === this.id
        );

        const updatedProductsArray = [...products];
        updatedProductsArray[existingProductIndex] = this;

        fs.writeFile(
          productsFilePath,
          JSON.stringify(updatedProductsArray),
          (error) => {
            if (error) {
              console.log(error);
            }
          }
        );
      });
    } else {
      this.id = uuid();

      Product.fetchAll((products) => {
        products.push(this);

        fs.writeFile(productsFilePath, JSON.stringify(products), (error) => {
          if (error) {
            console.log(error);
          }
        });
      });
    }
  }
};
