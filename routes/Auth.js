const express = require("express");
const router = express.Router();
const authController = require("../controllers/Auth");
const { verifyToken } = require("../middleware/Auth");

// --- PUBLIC ROUTES ---
// No token required for these
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// --- PROTECTED ROUTES ---
// The verifyToken middleware ensures only logged-in users can access these
router.get("/check-auth", verifyToken, authController.checkAuth);
router.get("/logout", authController.logout);

// Profile Management
router.get("/profile", verifyToken, authController.getProfile);
router.patch("/profile", verifyToken, authController.updateProfile);

module.exports = router;