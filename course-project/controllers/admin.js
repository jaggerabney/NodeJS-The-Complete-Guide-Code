const { validationResult } = require("express-validator/check");

const Product = require("../models/product");

exports.getAddProductPage = function (req, res, next) {
  res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
  });
};

exports.postAddProductPage = function (req, res, next) {
  const { title, imageUrl, description, price } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      title: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title,
        imageUrl,
        price,
        description,
      },
    });
  }

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
        hasError: false,
        errorMessage: null,
        product: product,
      });
    });
  }
};

exports.postEditProductPage = function (req, res, body) {
  const { title, imageUrl, price, description, productId } = req.body;

  Product.findById(productId).then((product) => {
    if (product.userId.toString() !== req.user._id.toString()) {
      req.flash("error", "Products not belonging to you cannot be edited.");

      return res.redirect("/admin/products");
    }

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

  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then((error, result) => {
      if (error.deletedCount < 1) {
        req.flash("error", "Products not belonging to you cannot be deleted.");
      }

      return res.redirect("/admin/products");
    })
    .catch((error) => console.log(error));
};

exports.getProductsPage = function (req, res, next) {
  let message = req.flash("error");

  message = message.length > 0 ? message[0] : null;

  Product.find({ userId: req.user._id }).then((products) => {
    res.render("admin/products", {
      products: products ? products : [],
      title: "Admin Products",
      path: "/admin/products",
      errorMessage: message,
    });
  });
};
