const Product = require("../models/product");

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

  Product.findById(productId, (product) => console.log(product));

  res.redirect("/");
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
  res.render("shop/cart", {
    title: "Cart",
    path: "/cart",
  });
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
