const Cart = require('../models/Cart');

// CREATE: Add item to cart
exports.create = async (req, res) => {
    try {
        const userId = req.user._id; // Securely get ID from middleware
        const { product, quantity } = req.body;

        // Check if product already exists in this user's cart
        let cartItem = await Cart.findOne({ user: userId, product });

        if (cartItem) {
            // If it exists, just update the quantity
            cartItem.quantity += (quantity || 1);
            await cartItem.save();
        } else {
            // If not, create a new entry
            cartItem = new Cart({
                ...req.body,
                user: userId
            });
            await cartItem.save();
        }

        // Populate product and nested brand for frontend UI
        const result = await cartItem.populate({
            path: "product",
            populate: { path: "brand" }
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding to cart' });
    }
};


// UPDATE: Update quantity
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and update only if it belongs to the user
        const updated = await Cart.findOneAndUpdate(
            { _id: id, user: req.user._id },
            req.body,
            { new: true }
        ).populate({
            path: "product",
            populate: { path: "brand" }
        });

        if (!updated) return res.status(404).json({ message: "Cart item not found" });

        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating cart' });
    }
};

// DELETE: Remove single item
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Cart.findOneAndDelete({ _id: id, user: req.user._id });

        if (!deleted) return res.status(404).json({ message: "Cart item not found" });

        res.status(200).json(deleted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting cart item' });
    }
};



// READ: Get cart for the logged-in user
exports.getByUserId = async (req, res) => {
    try {
        // No more req.params.id needed. Use the ID from the token!
        const result = await Cart.find({ user: req.user._id })
            .populate({
                path: "product",
                populate: { path: "brand" }
            });

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
};

// DELETE: Clear entire cart
exports.deleteAll = async (req, res) => {
    try {
        await Cart.deleteMany({ user: req.user._id });
        res.status(200).json({ message: "Cart cleared" });

    } catch (error) {
        res.status(500).json({ message: "Error resetting cart" });
    }
};