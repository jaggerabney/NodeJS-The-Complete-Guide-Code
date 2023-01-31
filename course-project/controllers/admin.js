const Product = require("../models/product");

exports.getAddProductPage = function (req, res, next) {
  res.render("admin/add-product", {
    title: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    formsCSS: true,
    productCSS: true,
  });
};

exports.postAddProductPage = function (req, res, next) {
  const { title, imageUrl, price, description } = req.body;

  const product = new Product(title, imageUrl, price, description);
  product.save();

  res.redirect("/");
};

exports.getProductsPage = function (req, res, next) {
  Product.fetchAll((products) => {
    res.render("admin/products", {
      products: products ? products : [],
      title: "Admin Products",
      path: "/admin/products",
    });
  });
};
