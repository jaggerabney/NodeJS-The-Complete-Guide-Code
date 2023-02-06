const Product = require("../models/product");
const ObjectId = require("mongodb").ObjectId;

exports.getAddProductPage = function (req, res, next) {
  res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
  });
};

exports.postAddProductPage = function (req, res, next) {
  const { title, imageUrl, description, price } = req.body;
  const product = new Product(title, imageUrl, description, price);

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
      });
    });
  }
};

exports.postEditProductPage = function (req, res, body) {
  const { title, imageUrl, price, description, productId } = req.body;
  const product = new Product(
    title,
    imageUrl,
    description,
    price,
    new ObjectId(productId)
  );

  product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((error) => console.log(error));

  return product.save();
};

exports.postDeleteProductPage = function (req, res, body) {
  const { productId } = req.body;

  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then(() => res.redirect("/admin/products"))
    .catch((error) => console.log(error));
};

exports.getProductsPage = function (req, res, next) {
  Product.fetchAll().then((products) => {
    res.render("admin/products", {
      products: products ? products : [],
      title: "Admin Products",
      path: "/admin/products",
    });
  });
};
