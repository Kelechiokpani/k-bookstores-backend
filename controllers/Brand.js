const Brand = require("../models/Brand");

// CREATE: Add a new Brand
exports.create = async (req, res) => {
    try {
        const brand = new Brand(req.body);
        const saved = await brand.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error(error);
        // Handle unique name constraint
        if (error.code === 11000) {
            return res.status(400).json({ message: "Brand name already exists" });
        }
        res.status(500).json({ message: "Error creating brand" });
    }
};

// READ: Fetch all Brands
exports.getAll = async (req, res) => {
    try {
        const result = await Brand.find({});
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching brands" });
    }
};

// UPDATE: Modify brand details
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Brand.findByIdAndUpdate(id, req.body, { new: true });

        if (!updated) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating brand" });
    }
};

// DELETE: Remove a brand
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Brand.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json({ _id: id, message: "Brand deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting brand" });
    }
};