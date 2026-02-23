const Order = require("../models/Order");
const Cart = require("../models/Cart");

// CREATE: Place an order and clear the user's cart
exports.create = async (req, res) => {
    try {
        // 1. Securely attach the user ID from the token
        const orderData = {
            ...req.body,
            user: req.user._id,
            status: 'pending' // Default status
        };

        const created = new Order(orderData);
        await created.save();

        // 2. IMPORTANT: Clear the user's cart after successful order placement
        await Cart.deleteMany({ user: req.user._id });

        // 3. Populate product details for the order confirmation UI
        const result = await created.populate([
            { path: "items.product", select: "title thumbnail price" },
            { path: "address" }
        ]);

        res.status(201).json(result);
    } catch (error) {
        console.error("Order Create Error:", error);
        res.status(500).json({ message: 'Failed to place order' });
    }
};

// READ: Get all orders (For high-level overview/tracking)
exports.getAll = async (req, res) => {
    try {
        let skip = 0;
        let limit = 0;

        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            skip = pageSize * (page - 1);
            limit = pageSize;
        }

        const totalDocs = await Order.countDocuments();
        const results = await Order.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")
            .populate("items.product")
            .exec();

        res.set("X-Total-Count", totalDocs);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

// READ: Get orders for a specific user
exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        // Security check: Users can only see their own orders
        if (id !== req.user._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You cannot view others' orders" });
        }

        const results = await Order.find({ user: id })
            .sort({ createdAt: -1 })
            .populate("items.product")
            .populate("address");

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your orders' });
    }
};

// UPDATE: Update order status or details
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and update. We populate the response so Redux updates the UI correctly.
        const updated = await Order.findByIdAndUpdate(id, req.body, { new: true })
            .populate("items.product")
            .populate("address");

        if (!updated) return res.status(404).json({ message: "Order not found" });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
};

// DELETE: Cancel/Remove an order
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;

        // We typically don't hard-delete orders for accounting reasons,
        // but here is the functionality for your CRUD:
        const deleted = await Order.findByIdAndDelete(id);

        if (!deleted) return res.status(404).json({ message: "Order not found" });

        res.status(200).json({ _id: id, message: "Order deleted" });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
};