const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProductListPage = function (req, res, next) {
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      products: products ? products : [],
      title: "All Products",
      path: "/products",
    });
  });
};

exports.getProductPage = function (req, res, next) {
  const productId = req.params.productId;

  Product.findById(productId, (product) => {
    if (product) {
      res.render("shop/product-detail", {
        title: product.title,
        path: "/products",
        product: product,
      });

      return;
    }

    next();
  });
};

exports.getIndexPage = function (req, res, next) {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      products: products ? products : [],
      title: "Shop",
      path: "/",
    });
  });
};

exports.getCartPage = function (req, res, next) {
  Cart.get((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];

      for (let product of products) {
        const cartProductData = cart.products.find(
          (element) => element.id === product.id
        );

        if (cartProductData) {
          cartProducts.push({
            data: product,
            quantity: cartProductData.quantity,
          });
        }
      }

      res.render("shop/cart", {
        title: "Your Cart",
        path: "/cart",
        products: cartProducts,
      });
    });
  });
};

exports.postCartPage = function (req, res, next) {
  const productId = req.body.productId;

  Product.findById(productId, (product) => {
    Cart.add(product);
  });

  res.redirect("/cart");
};

exports.getOrdersPage = function (req, res, next) {
  res.render("shop/orders", {
    title: "Orders",
    path: "/orders",
  });
};

exports.getCheckoutPage = function (req, res, next) {
  res.render("shop/checkout", {
    title: "Checkout",
    path: "/checkout",
  });
};
