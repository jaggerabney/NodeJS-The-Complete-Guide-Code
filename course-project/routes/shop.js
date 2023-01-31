const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndexPage);
router.get("/products", shopController.getProductListPage);
router.get("/products/:productId", shopController.getProductPage);
router.get("/cart", shopController.getCartPage);
router.post("/cart", shopController.postCartPage);
router.get("/checkout", shopController.getCheckoutPage);
router.get("/orders", shopController.getOrdersPage);

module.exports = router;
