const Category = require("../models/Category");

// CREATE: Add a new category
exports.create = async (req, res) => {
    try {
        const category = new Category(req.body);
        const saved = await category.save();
        res.status(201).json(saved);
    } catch (error) {
        console.log(error);
        // Handle unique constraint for category names
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category already exists" });
        }
        res.status(500).json({ message: "Error creating category" });
    }
};

// READ: Fetch all categories
exports.getAll = async (req, res) => {
    try {
        const result = await Category.find({});
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

// UPDATE: Rename or modify a category
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });

        if (!updated) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating category" });
    }
};

// DELETE: Remove a category
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ _id: id, message: "Category deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting category" });
    }
};