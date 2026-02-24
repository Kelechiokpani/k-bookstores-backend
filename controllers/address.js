const Address = require("../models/address");

// CREATE: Add a new address for the logged-in user
exports.create = async (req, res) => {
    try {
        // Securely assign the user ID from the verified token
        const created = new Address({
            ...req.body,
            user: req.user._id
        });

        await created.save();
        res.status(201).json(created);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding address, please try again later' });
    }
};

// READ: Get all addresses for a specific user
exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params;

        // Ownership Check: Ensure user is only fetching their own addresses
        if (id !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. Unauthorized request." });
        }

        const results = await Address.find({ user: id });
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching addresses, please try again later' });
    }
};

// UPDATE: Update a specific address
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and update only if the address belongs to the logged-in user
        const updated = await Address.findOneAndUpdate(
            { _id: id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Address not found or unauthorized" });
        }

        res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating address, please try again later' });
    }
};

// DELETE: Remove an address
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete only if the address belongs to the logged-in user
        const deleted = await Address.findOneAndDelete({ _id: id, user: req.user._id });

        if (!deleted) {
            return res.status(404).json({ message: "Address not found or unauthorized" });
        }

        res.status(200).json(deleted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting address, please try again later' });
    }
};