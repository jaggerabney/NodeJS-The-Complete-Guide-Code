const express = require("express");

const productsController = require("../controllers/products");

const router = express.Router();

router.get("/", productsController.getShopPage);

module.exports = router;
