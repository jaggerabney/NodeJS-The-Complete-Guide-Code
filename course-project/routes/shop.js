const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndexPage);

router.get("/products", shopController.getProductListPage);

router.get("/cart", shopController.getCartPage);

router.get("/checkout", shopController.getCheckoutPage);

module.exports = router;
