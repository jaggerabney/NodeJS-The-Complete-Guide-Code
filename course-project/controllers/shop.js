const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProductListPage = function (req, res, next) {
  Product.findAll()
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

  Product.findByPk(productId)
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
  Product.findAll()
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
  // Cart.get((cart) => {
  //   Product.findAll().then((products) => {
  //     const cartProducts = [];

  //     for (let product of products) {
  //       const cartProductData = cart.products.find(
  //         (row) => row.id === product.id
  //       );

  //       if (cartProductData) {
  //         cartProducts.push({
  //           data: product,
  //           quantity: cartProductData.quantity,
  //         });
  //       }
  //     }

  //     res.render("shop/cart", {
  //       title: "Your Cart",
  //       path: "/cart",
  //       products: cartProducts,
  //     });
  //   });
  // });

  req.user
    .getCart()
    .then((cart) =>
      cart.getProducts().then((products) => {
        res.render("shop/cart", {
          title: "Your Cart",
          path: "/cart",
          products: products,
        });
      })
    )
    .catch((error) => console.log(error));
};

exports.postCartPage = function (req, res, next) {
  const productId = req.body.productId;
  let newQuantity = 1;
  let fetchedCart;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;

      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      let product;

      if (products) {
        product = products[0];
      }

      if (product) {
        newQuantity = product.cartItem.quantity + 1;

        return product;
      }

      return Product.findByPk(productId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => res.redirect("/cart"))
    .catch((error) => console.log(error));
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
