const express = require("express");

const adminController = require("../controllers/admin");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProductPage);
// /admin/products => GET
router.get("/products", adminController.getProductsPage);
// /admin/add-product => POST
router.post("/add-product", adminController.postAddProductPage);
// /admin/edit-product/[productId] => GET
router.get("/edit-product/:productId", adminController.getEditProductPage);

module.exports = router;
