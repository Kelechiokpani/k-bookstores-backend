const express = require('express');
const orderController = require("../controllers/order");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();


router
    .post("/", verifyToken, orderController.create)          // Checkout
    .get("/", verifyToken, orderController.getAll)           // Global view
    .get("/user/:id", verifyToken, orderController.getByUserId) // Personal history
    .patch("/:id", verifyToken, orderController.updateById)  // Status update
    .delete("/:id", verifyToken, orderController.deleteById); // Cancellation

module.exports = router;