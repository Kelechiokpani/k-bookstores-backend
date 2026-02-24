const express = require("express");
const router = express.Router();
const {
    addToWishlist,
    getWishlistByUser,
    deleteFromWishlist,
    clearWishlist
} = require("../controllers/wishlist");

// FIX: Ensure this matches your filename "auth.js" (Capital A)
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken); // Apply to all routes below
router.post("/", addToWishlist);
router.get("/", getWishlistByUser);

router.delete("/reset", clearWishlist);

router.delete("/:id", deleteFromWishlist);

module.exports = router;