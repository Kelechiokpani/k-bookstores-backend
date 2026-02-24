const express = require('express');
const router = express.Router();
const cartController = require("../controllers/cart");
const { verifyToken } = require("../middleware/auth");



router
    .post("/", verifyToken, cartController.create)
    .get("/", verifyToken, cartController.getByUserId)
    .patch("/:id", verifyToken, cartController.updateById)

     .delete("/reset", verifyToken, cartController.deleteAll)

    .delete("/:id", verifyToken, cartController.deleteById)



module.exports = router;