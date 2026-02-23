const express = require("express");
const brandController = require("../controllers/Brand");
const router = express.Router();

router
    .post("/", brandController.create)           // CREATE
    .get("/", brandController.getAll)            // READ
    .patch("/:id", brandController.updateById)    // UPDATE
    .delete("/:id", brandController.deleteById);  // DELETE

module.exports = router;