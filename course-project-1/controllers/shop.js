const fs = require("fs");
const path = require("path");

const pdfDocument = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const generateError = require("../util/generateError");

const ITEMS_PER_PAGE = Number(process.env.ITEMS_PER_PAGE);

exports.getProductListPage = function (req, res, next) {
  const page = req.query.page ? Number(req.query.page) : 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        products: products ? products : [],
        title: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        finalPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  const page = req.query.page ? Number(req.query.page) : 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        products: products ? products : [],
        title: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        finalPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
        createdAt: new Date().getTime(),
      });

      order.save();
    })
    .then(() =>
      User.findById(req.session.user._id).then((user) => user.clearCart())
    )
    .then(() => res.redirect("/orders"))
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
  let products, total;

  req.user
    .populate("cart.items.productId")
    .then((data) => {
      console.log("Populated cart items!");
      products = data.cart.items;
      total = 0;

      products.forEach(
        (product) => (total += product.quantity * product.productId.price)
      );

      console.log("Handing off to Stripe...");
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((product) => {
          return {
            quantity: product.quantity,
            price_data: {
              currency: "usd",
              unit_amount: product.productId.price * 100,
              product_data: {
                name: product.productId.title,
                description: product.productId.description,
              },
            },
          };
        }),
        mode: "payment",
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      console.log("Rendering checkout page...");

      res.render("shop/checkout", {
        title: "Checkout",
        path: "/checkout",
        isAuthenticated: req.session.isLoggedIn,
        products,
        total: new Intl.NumberFormat("en-us", {
          style: "currency",
          currency: "USD",
        }).format(total),
        sessionId: session.id,
      });
    })
    .catch((error) => next(generateError(error.message, 500)));
};

exports.getInvoice = function (req, res, next) {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found!"));
      }

      if (order.user.userId.toString() === req.user._id.toString()) {
        const invoiceName = `invoice-${orderId}.pdf`;
        const invoicePath = path.join("data", "invoices", invoiceName);
        const pdf = new pdfDocument();
        let totalPrice = 0;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);

        pdf.pipe(fs.createWriteStream(invoicePath));
        pdf.pipe(res);

        pdf.fontSize(26).text("Invoice", { underline: true });
        pdf.fontSize(14).text("\n");

        order.products.forEach((product) => {
          const totalProductPrice = product.quantity * product.data.price;
          totalPrice += totalProductPrice;

          pdf
            .fontSize(14)
            .text(
              `${product.data.title} - ${product.quantity} ($${totalProductPrice})\n`
            );
        });

        pdf.fontSize(14).text("\n");
        pdf.fontSize(20).text(`Total price: $${totalPrice}`);

        pdf.end();
      } else {
        return next(new Error("Not authorized to access invoice!"));
      }
    })
    .catch((error) => next(error));
};
