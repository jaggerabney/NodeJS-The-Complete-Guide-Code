const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndexPage);
router.get("/products", shopController.getProductListPage);
router.get("/products/:productId", shopController.getProductPage);
router.get("/cart", shopController.getCartPage);
router.post("/cart", shopController.postCartPage);
router.post("/cart-delete-item", shopController.postCartDeletePage);
router.post("/create-order", shopController.postOrderPage);
// router.get("/orders", shopController.getOrdersPage);

module.exports = router;
