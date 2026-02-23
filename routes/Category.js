const express = require("express");
const categoryController = require("../controllers/Category");
const router = express.Router();


router
    .post("/", categoryController.create)        // CREATE
    .get("/", categoryController.getAll)         // READ
    .patch("/:id", categoryController.updateById) // UPDATE
    .delete("/:id", categoryController.deleteById); // DELETE

module.exports = router;