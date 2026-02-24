const express = require("express");
const addressController = require("../controllers/address");
const { verifyToken } = require("../middleware/Auth");
const router = express.Router();


router
    .post("/", verifyToken, addressController.create)
    .get("/user/:id", verifyToken, addressController.getByUserId)
    .patch("/:id", verifyToken, addressController.updateById)
    .delete("/:id", verifyToken, addressController.deleteById);

module.exports = router;