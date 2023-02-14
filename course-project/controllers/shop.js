const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

exports.getProductListPage = function (req, res, next) {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        products: products ? products : [],
        title: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.getProductPage = function (req, res, next) {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (product) {
        res.render("shop/product-detail", {
          title: product.title,
          path: "/products",
          product: product,
          isAuthenticated: req.session.isLoggedIn,
        });

        return;
      }

      next();
    })
    .catch((error) => console.log(error));
};

exports.getIndexPage = function (req, res, next) {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        products: products ? products : [],
        title: "Shop",
        path: "/",
      });
    })
    .catch((error) => console.log(error));
};

exports.getCartPage = function (req, res, next) {
  User.findById(req.session.user._id)
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;

      res.render("shop/cart", {
        title: "Your Cart",
        path: "/cart",
        products: products,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.postCartPage = function (req, res, next) {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) =>
      User.findById(req.session.user).then((user) => user.addToCart(product))
    )
    .then(() => res.redirect("/cart"));
};

exports.postCartDeletePage = function (req, res, next) {
  const productId = req.body.productId;

  User.findById(req.session.user._id)
    .then((user) => {
      user
        .removeFromCart(productId)
        .then(() => res.redirect("/cart"))
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
};

exports.postOrderPage = function (req, res, next) {
  User.findById(req.session.user._id)
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          data: { ...item.productId._doc },
        };
      });

      const order = new Order({
        user: {
          email: req.session.user.email,
          userId: req.session.user._id,
        },
        products: products,
      });

      order.save();
    })
    .then(() =>
      User.findById(req.session.user._id).then((user) => user.clearCart())
    )
    .then(() => {
      res.redirect("/orders");
    })
    .catch((error) => console.log(error));
};

exports.getOrdersPage = function (req, res, next) {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        title: "Orders",
        path: "/orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.getCheckoutPage = function (req, res, next) {
  res.render("shop/checkout", {
    title: "Checkout",
    path: "/checkout",
    isAuthenticated: req.session.isLoggedIn,
  });
};
