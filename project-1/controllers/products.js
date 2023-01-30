const products = [];

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
  products.push({ title: req.body.title });
  res.redirect("/");
};

exports.getProducts = function (req, res, next) {
  res.render("shop", {
    products: products,
    title: "Shop",
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true,
  });
};

exports.products = products;
