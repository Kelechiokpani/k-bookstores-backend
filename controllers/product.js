const Product = require("../models/product");

// CREATE
exports.create = async (req, res) => {
    try {
        const created = new Product(req.body);
        await created.save();
        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding product' });
    }
};

// READ ALL (With Filtering, Sorting, and Pagination)
exports.getAll = async (req, res) => {
    try {
        const filter = {};
        const sort = {};
        let skip = 0;
        let limit = 0;

        // Filtering by Brand (Supports multiple IDs)
        if (req.query.brand) {
            filter.brand = { $in: req.query.brand.split(',') };
        }

        // Filtering by Category (Supports multiple IDs)
        if (req.query.category) {
            filter.category = { $in: req.query.category.split(',') };
        }

        // Filter for non-deleted products (Standard user view)
        if (req.query.user) {
            filter.isDeleted = false;
        }

        // Sorting (e.g., sort=price&order=desc)
        if (req.query.sort) {
            sort[req.query.sort] = req.query.order === 'desc' ? -1 : 1;
        }

        // Pagination
        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            skip = pageSize * (page - 1);
            limit = pageSize;
        }

        // Get total count for the frontend to calculate pages
        const totalDocs = await Product.countDocuments(filter);

        // Execute main query
        const results = await Product.find(filter)
            .sort(sort)
            .populate("brand")
            .populate("category")
            .skip(skip)
            .limit(limit)
            .exec();

        // Pass total count in headers (for your Redux logic)
        res.set("X-Total-Count", totalDocs);
        res.status(200).json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// READ BY ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Product.findById(id).populate("brand").populate("category");
        if (!result) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error getting product details' });
    }
};

// UPDATE
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true })
            .populate("brand")
            .populate("category");
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
};

// SOFT DELETE
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
            .populate("brand");
        res.status(200).json(deleted);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
};

// UNDELETE (Restore)
exports.undeleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const unDeleted = await Product.findByIdAndUpdate(id, { isDeleted: false }, { new: true })
            .populate('brand');
        res.status(200).json(unDeleted);
    } catch (error) {
        res.status(500).json({ message: 'Error restoring product' });
    }
};