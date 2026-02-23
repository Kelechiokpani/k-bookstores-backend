const Wishlist = require("../models/Wishlist");


// CREATE: Add a product to the wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const existingItem = await Wishlist.findOne({
            user: req.user._id,
            product: req.body.product
        });

        if (existingItem) {
            return res.status(400).json({ message: "Product already in wishlist" });
        }

        const item = new Wishlist({ ...req.body, user: req.user._id });
        await item.save();

        // Populate product to ensure frontend has book details immediately
        const result = await Wishlist.findById(item._id).populate("product");
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// READ: Get all wishlist items for the logged-in user
exports.getWishlistByUser = async (req, res) => {
    try {
        const items = await Wishlist.find({ user: req.user._id }).populate("product");
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json(error);
    }
};

// controllers/Wishlist.js

exports.clearWishlist = async (req, res) => {
    try {
        console.log("Clearing wishlist for user:", req.user._id);
        const result = await Wishlist.deleteMany({ user: req.user._id });

        res.status(200).json({
            message: "Wishlist cleared successfully",
            count: result.deletedCount
        });
    } catch (error) {
        console.error("Clear Wishlist Error:", error);
        res.status(500).json({ message: "Server error while clearing wishlist" });
    }
};



exports.deleteFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;

        // Safety check: if id is "clear", it means the router order is wrong
        if (id === "clear") {
            return exports.clearWishlist(req, res);
        }

        const deletedItem = await Wishlist.findOneAndDelete({
            _id: id,
            user: req.user._id
        });

        if (!deletedItem) {
            return res.status(404).json({ message: "Wishlist item not found" });
        }

        res.status(200).json({ _id: id, message: "Removed from wishlist" });
    } catch (error) {
        res.status(500).json({ message: "Error removing item" });
    }
};