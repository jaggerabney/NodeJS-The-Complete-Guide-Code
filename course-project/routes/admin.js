const express = require("express");
const path = require("path");

const adminController = require("../controllers/admin");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProductPage);

// /admin/products => GET
router.get("/products", adminController.getProductsPage);

// /admin/add-product => POST
router.post("/add-product", adminController.postAddProductPage);

module.exports = router;
