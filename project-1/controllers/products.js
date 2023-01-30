const Product = require("../models/product");

exports.getAddProductPage = function (req, res, next) {
  res.render("add-product", {
    title: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    formsCSS: true,
    productCSS: true,
  });
};

exports.postAddProductPage = function (req, res, next) {
  const product = new Product(req.body.title);
  product.save();

  res.redirect("/");
};

exports.getShopPage = function (req, res, next) {
  Product.fetchAll((products) => {
    res.render("shop", {
      products: products ? products : [],
      title: "Shop",
      path: "/",
      hasProducts: products ? products.length > 0 : false,
      activeShop: true,
      productCSS: true,
    });
  });
};
