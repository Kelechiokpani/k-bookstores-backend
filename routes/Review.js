const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/Review");
const { verifyToken } = require("../middleware/auth");



router
    .post("/", verifyToken, reviewController.create)          // User must be logged in to review
    .get("/product/:id", reviewController.getByProductId)     // Public can see reviews
    .patch("/:id", verifyToken, reviewController.updateById)  // User must own the review
    .delete("/:id", verifyToken, reviewController.deleteById); // User must own the review

module.exports = router;