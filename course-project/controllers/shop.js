const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProductListPage = function (req, res, next) {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/product-list", {
        products: rows ? rows : [],
        title: "All Products",
        path: "/products",
      });
    })
    .catch((error) => console.log(error));
};

exports.getProductPage = function (req, res, next) {
  const productId = req.params.productId;

  Product.findById(productId)
    .then(([product]) => {
      if (product) {
        res.render("shop/product-detail", {
          title: product.title,
          path: "/products",
          product: product[0],
        });

        return;
      }

      next();
    })
    .catch((error) => console.log(error));
};

exports.getIndexPage = function (req, res, next) {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/index", {
        products: rows ? rows : [],
        title: "Shop",
        path: "/",
      });
    })
    .catch((error) => console.log(error));
};

exports.getCartPage = function (req, res, next) {
  Cart.get((cart) => {
    Product.fetchAll().then(([rows, fieldData]) => {
      const cartProducts = [];

      for (let product of rows) {
        const cartProductData = cart.products.find(
          (row) => row.id === product.id
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

  Product.findById(productId).then(([product]) => {
    Cart.add(product[0]);

    res.redirect("/cart");
  });
};

exports.postCartDeletePage = function (req, res, next) {
  const productId = req.body.productId;

  Product.findById(productId).then(() => {
    Cart.deleteItemById(productId);

    res.redirect("/cart");
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
