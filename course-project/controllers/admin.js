const { v4 } = require("uuid");

const Product = require("../models/product");

exports.getAddProductPage = function (req, res, next) {
  res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
  });
};

exports.postAddProductPage = function (req, res, next) {
  const { title, imageUrl, description, price } = req.body;
  const id = v4();

  Product.create({
    title,
    imageUrl,
    description,
    price,
    id,
  })
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
};

exports.getEditProductPage = function (req, res, next) {
  const isEditing = req.query.edit === "true";

  if (!isEditing) {
    return res.redirect("/");
  } else {
    const productId = req.params.productId;

    Product.findById(productId, (product) => {
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

  const updatedProduct = new Product(
    productId,
    title,
    imageUrl,
    description,
    price
  );
  updatedProduct.save();

  res.redirect("/admin/products");
};

exports.postDeleteProductPage = function (req, res, body) {
  const { productId } = req.body;

  Product.deleteProductById(productId);

  res.redirect("/admin/products");
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
