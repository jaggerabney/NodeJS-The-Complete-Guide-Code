const { validationResult } = require("express-validator/check");

const Product = require("../models/product");
const generateError = require("../util/generateError");
const deleteFile = require("../util/file");

const ITEMS_PER_PAGE = Number(process.env.ITEMS_PER_PAGE);

exports.getAddProductPage = function (req, res, next) {
  return res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProductPage = function (req, res, next) {
  const { title, description, price } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      title: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: "Attached file is not of a valid file type!",
      product: {
        title,
        price,
        description,
      },
      validationErrors: [],
    });
  }

  const imageUrl = "/" + image.path;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      title: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title,
        price,
        description,
      },
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title,
    imageUrl,
    description,
    price,
    userId: req.session.user._id,
  });

  return product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch(() => next(generateError("Product creation failed!", 500)));
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

      return res.render("admin/edit-product", {
        title: "Edit Product",
        path: "/admin/edit-product",
        editing: isEditing,
        hasError: false,
        errorMessage: null,
        product: product,
        validationErrors: [],
      });
    });
  }
};

exports.postEditProductPage = function (req, res, body) {
  const { title, price, description, productId } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      title: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product: {
        title,
        price,
        description,
        _id: productId,
      },
      validationErrors: errors.array(),
    });
  }

  Product.findById(productId).then((product) => {
    if (product.userId.toString() !== req.user._id.toString()) {
      req.flash("error", "Products not belonging to you cannot be edited.");

      return res.redirect("/admin/products");
    }

    product.title = title;
    product.price = price;
    product.description = description;
    if (image) {
      deleteFile(product.imageUrl);

      product.imageUrl = image.path;
    }

    return product
      .save()
      .then(() => res.redirect("/admin/products"))
      .catch(() => next(generateError("Product editing failed!", 500)));
  });
};

exports.deleteProduct = function (req, res, next) {
  const { productId } = req.params;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found!"));
      }

      deleteFile(product.imageUrl.substring(1));

      return Product.deleteOne({ _id: productId, userId: req.user._id }).then(
        (error, result) => {
          if (error.deletedCount < 1) {
            req.flash(
              "error",
              "Products not belonging to you cannot be deleted."
            );
          }

          res.status(200).json({
            message: "Success!",
          });
        }
      );
    })
    .catch(() =>
      res.status(500).json({
        message: "Product deletion failed!",
      })
    );
};

exports.getProductsPage = function (req, res, next) {
  const page = req.query.page ? Number(req.query.page) : 1;
  let message = req.flash("error");
  let totalItems;

  message = message.length > 0 ? message[0] : null;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("admin/products", {
        products: products ? products : [],
        title: "Admin Products",
        path: "/admin/products",
        errorMessage: message,
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
