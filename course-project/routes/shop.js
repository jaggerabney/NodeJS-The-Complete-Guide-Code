const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getIndexPage);
router.get("/products", shopController.getProductListPage);
router.get("/products/:productId", shopController.getProductPage);
router.get("/cart", isAuth, shopController.getCartPage);
router.post("/cart", isAuth, shopController.postCartPage);
router.post("/cart-delete-item", isAuth, shopController.postCartDeletePage);
router.get("/orders", isAuth, shopController.getOrdersPage);
router.get("/orders/:orderId", isAuth, shopController.getInvoice);
router.get("/checkout", isAuth, shopController.getCheckoutPage);
router.get("/checkout/success", isAuth, shopController.postOrderPage);
router.get("/checkout/cancel", isAuth, shopController.getCheckoutPage);

module.exports = router;
