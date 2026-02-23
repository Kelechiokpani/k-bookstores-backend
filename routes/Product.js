const express = require('express');
const productController = require("../controllers/Product");
const router = express.Router();

router
    .post("/", productController.create)                     // Create
    .get("/", productController.getAll)                      // Read All (Filters/Pagination)
    .get("/:id", productController.getById)                  // Read Single
    .patch("/:id", productController.updateById)            // Update
    .patch("/undelete/:id", productController.undeleteById)  // Restore
    .delete("/:id", productController.deleteById);           // Soft Delete

module.exports = router;