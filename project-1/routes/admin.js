const express = require("express");
const path = require("path");

const productsController = require("../controllers/products");

const router = express.Router();

router.get("/add-product", productsController.getAddProductPage);
router.post("/add-product", productsController.postAddProductPage);

module.exports = router;
