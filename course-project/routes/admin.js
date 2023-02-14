const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProductPage);
// /admin/products => GET
router.get("/products", isAuth, adminController.getProductsPage);
// /admin/add-product => POST
router.post("/add-product", isAuth, adminController.postAddProductPage);
// /admin/edit-product/[productId] => GET
router.get(
  "/edit-product/:productId",
  isAuth,
  adminController.getEditProductPage
);
// /admin/edit-product => POST
router.post("/edit-product", isAuth, adminController.postEditProductPage);
// /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProductPage);

module.exports = router;
