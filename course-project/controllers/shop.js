const Product = require("../models/product");
// const Order = require("../models/order");

exports.getProductListPage = function (req, res, next) {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        products: products ? products : [],
        title: "All Products",
        path: "/products",
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
        });

        return;
      }

      next();
    })
    .catch((error) => console.log(error));
};

exports.getIndexPage = function (req, res, next) {
  Product.fetchAll()
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
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        title: "Your Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((error) => console.log(error));
};

exports.postCartPage = function (req, res, next) {
  const productId = req.body.productId;

  Product.findById(productId).then((product) => {
    return req.user.addToCart(product).then(() => res.redirect("/cart"));
  });
};

exports.postCartDeletePage = function (req, res, next) {
  const productId = req.body.productId;

  req.user
    .getCart()
    .then((cart) => cart.getProducts({ where: { id: productId } }))
    .then((products) => {
      const product = products[0];

      return product.cartItem.destroy();
    })
    .then(() => res.redirect("/cart"))
    .catch((error) => console.log(error));
};

exports.postOrderPage = function (req, res, next) {
  let fetchedCart;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;

      return cart.getProducts();
    })
    .then((products) => {
      req.user.createOrder().then((order) => {
        return order.addProducts(
          products.map((product) => {
            product.orderItem = { quantity: product.cartItem.quantity };

            return product;
          })
        );
      });
    })
    .then(() => fetchedCart.setProducts(null))
    .then(() => res.redirect("/orders"))
    .catch((error) => console.log(error));
};

exports.getOrdersPage = function (req, res, next) {
  req.user
    .getOrders({ include: ["products"] })
    .then((orders) => {
      res.render("shop/orders", {
        title: "Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((error) => console.log(error));
};

exports.getCheckoutPage = function (req, res, next) {
  res.render("shop/checkout", {
    title: "Checkout",
    path: "/checkout",
  });
};
