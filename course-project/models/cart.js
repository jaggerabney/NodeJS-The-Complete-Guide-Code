const fs = require("fs");
const path = require("path");

const rootDir = require("../util/path");
const Product = require("../models/product");
const { Console } = require("console");

const CART_FILE_PATH = path.join(rootDir, "data", "cart.json");

module.exports = class Cart {
  static add(product) {
    fs.readFile(CART_FILE_PATH, (error, content) => {
      let cart = { products: [], totalPrice: 0.0 };

      if (!error) {
        cart = JSON.parse(content);
      }

      const existingProductIndex = cart.products.findIndex(
        (element) => element.id === product.id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.quantity += 1;

        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = product;
        updatedProduct.quantity = 1;
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = Number(cart.totalPrice) + Number(product.price);

      fs.writeFile(CART_FILE_PATH, JSON.stringify(cart), (error) => {});
    });
  }

  static get(callback) {
    fs.readFile(CART_FILE_PATH, (error, content) => {
      const cart = JSON.parse(content);

      if (error) {
        callback(null);
      } else {
        callback(cart);
      }
    });
  }

  static deleteItemById(id) {
    Cart.get((cart) => {
      const cartItemIndex = cart.products.findIndex(
        (element) => element.id === id
      );
      const cartItem = cart.products[cartItemIndex];

      if (cartItem.quantity > 1) {
        const updatedCartItem = { ...cartItem };
        updatedCartItem.quantity -= 1;

        cart.products[cartItemIndex] = updatedCartItem;
        cart.totalPrice -= updatedCartItem.price;
      } else {
        if (cartItemIndex !== -1) {
          cart.products.splice(cartItemIndex, 1);
        }

        cart.totalPrice -= cartItem.price * cartItem.quantity;
      }

      fs.writeFile(CART_FILE_PATH, JSON.stringify(cart), (error) => {
        if (error) {
          console.log(error);
        }
      });
    });
  }
};
