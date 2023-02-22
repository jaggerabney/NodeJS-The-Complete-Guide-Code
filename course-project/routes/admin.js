const express = require("express");
const { check, body } = require("express-validator/check");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProductPage);
// /admin/products => GET
router.get("/products", isAuth, adminController.getProductsPage);
// /admin/add-product => POST
router.post(
  "/add-product",
  body("title").isString().isLength({ min: 3 }).trim(),
  body("price").isFloat(),
  body("description").isLength({ min: 5, max: 400 }),
  isAuth,
  adminController.postAddProductPage
);
// /admin/edit-product/[productId] => GET
router.get(
  "/edit-product/:productId",
  isAuth,
  adminController.getEditProductPage
);
// /admin/edit-product => POST
router.post(
  "/edit-product",
  isAuth,
  body("title").isString().isLength({ min: 3 }).trim(),
  body("price").isFloat(),
  body("description").isLength({ min: 5, max: 400 }),
  adminController.postEditProductPage
);
// /admin/delete-product => POST
router.delete("/delete/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
