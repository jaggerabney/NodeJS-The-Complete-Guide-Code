const Product = require("../models/product");

exports.getAddProductPage = function (req, res, next) {
  res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postAddProductPage = function (req, res, next) {
  const { title, imageUrl, description, price } = req.body;

  const product = new Product({
    title,
    imageUrl,
    description,
    price,
    userId: req.session.user._id,
  });

  product.save().then(() => res.redirect("/admin/products"));
};

exports.getEditProductPage = function (req, res, next) {
  const isEditing = req.query.edit === "true";

  if (!isEditing) {
    return res.redirect("/");
  } else {
    const productId = req.params.productId;

    Product.findById(productId).then((product) => {
      if (!product) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
        title: "Edit Product",
        path: "/admin/edit-product",
        editing: isEditing,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
      });
    });
  }
};

exports.postEditProductPage = function (req, res, body) {
  const { title, imageUrl, price, description, productId } = req.body;

  Product.findById(productId).then((product) => {
    product.title = title;
    product.price = price;
    product.description = description;
    product.imageUrl = imageUrl;

    return product
      .save()
      .then(() => res.redirect("/admin/products"))
      .catch((error) => console.log(error));
  });
};

exports.postDeleteProductPage = function (req, res, body) {
  const { productId } = req.body;

  Product.findByIdAndRemove(productId)
    .then(() => res.redirect("/admin/products"))
    .catch((error) => console.log(error));
};

exports.getProductsPage = function (req, res, next) {
  Product.find().then((products) => {
    res.render("admin/products", {
      products: products ? products : [],
      title: "Admin Products",
      path: "/admin/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  });
};
