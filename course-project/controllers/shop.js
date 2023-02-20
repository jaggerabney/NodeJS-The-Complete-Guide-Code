const fs = require("fs");
const path = require("path");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const generateError = require("../util/generateError");

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
    .catch(() => next(generateError("Couldn't get products!", 500)));
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
    .catch(() => next(generateError("Couldn't get product!", 500)));
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
    .catch(() => next(generateError("Couldn't get products!", 500)));
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
    .catch(() => next(generateError("Couldn't get cart!", 500)));
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
      return user
        .removeFromCart(productId)
        .then(() => res.redirect("/cart"))
        .catch(() =>
          next(generateError("Couldn't remove product from cart!", 500))
        );
    })
    .catch(() =>
      next(generateError("Couldn't find user in current session!", 500))
    );
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
    .catch(() => next(generateError("Couldn't post order!", 500)));
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
    .catch(() => next(generateError("Couldn't find order!", 500)));
};

exports.getCheckoutPage = function (req, res, next) {
  res.render("shop/checkout", {
    title: "Checkout",
    path: "/checkout",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getInvoice = function (req, res, next) {
  const orderId = req.params.orderId;
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join("data", "invoices", invoiceName);

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found!"));
      }

      if (order.user.userId.toString() === req.user._id.toString()) {
        // fs.readFile(invoicePath, (error, data) => {
        //   if (error) {
        //     return next(error);
        //   }

        //   res.setHeader("Content-Type", "application/pdf");
        //   res.setHeader(
        //     "Content-Disposition",
        //     `inline; filename=${invoiceName}`
        //   );
        //   res.send(data);
        // });

        const file = fs.createReadStream(invoicePath);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);

        file.pipe(res);
      } else {
        return next(new Error("Not authorized to access invoice!"));
      }
    })
    .catch((error) => next(error));
};
