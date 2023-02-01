const Product = require("../models/product");

exports.getAddProductPage = function (req, res, next) {
  res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
  });
};

exports.postAddProductPage = function (req, res, next) {
  const { title, imageUrl, description, price } = req.body;

  const product = new Product(title, imageUrl, description, price);
  product.save();

  res.redirect("/");
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

exports.getProductsPage = function (req, res, next) {
  Product.fetchAll((products) => {
    res.render("admin/products", {
      products: products ? products : [],
      title: "Admin Products",
      path: "/admin/products",
    });
  });
};
