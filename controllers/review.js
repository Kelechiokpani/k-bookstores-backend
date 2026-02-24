const Review = require("../models/review");

// CREATE: Post a new review
exports.create = async (req, res) => {
    try {
        // Inject user ID from the verified token middleware
        const reviewData = {
            ...req.body,
            user: req.user._id
        };

        const newReview = new Review(reviewData);
        await newReview.save();

        // Populate after saving so the frontend gets the user's name immediately
        const created = await newReview.populate({ path: 'user', select: "name email" });

        res.status(201).json(created);
    } catch (error) {
        console.log(error);
        // Handle duplicate review error (if you added the unique index)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }
        return res.status(500).json({ message: 'Error posting review, please try again later' });
    }
};

// READ: Get reviews for a specific product (with Pagination)
exports.getByProductId = async (req, res) => {
    try {
        const { id } = req.params;
        let skip = 0;
        let limit = 0;

        if (req.query.page && req.query.limit) {
            const pageSize = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            skip = pageSize * (page - 1);
            limit = pageSize;
        }

        const totalDocs = await Review.countDocuments({ product: id });
        const result = await Review.find({ product: id })
            .sort({ createdAt: -1 }) // Show newest reviews first
            .skip(skip)
            .limit(limit)
            .populate({ path: 'user', select: "name" })
            .exec();

        res.set("X-Total-Count", totalDocs);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting reviews' });
    }
};

// UPDATE: Update a review (Only if it belongs to the user)
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure the review belongs to the person updating it
        const updated = await Review.findOneAndUpdate(
            { _id: id, user: req.user._id },
            req.body,
            { new: true }
        ).populate({ path: 'user', select: "name" });

        if (!updated) return res.status(404).json({ message: "Review not found or unauthorized" });

        res.status(200).json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating review' });
    }
};

// DELETE: Delete a review
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Review.findOneAndDelete({ _id: id, user: req.user._id });

        if (!deleted) return res.status(404).json({ message: "Review not found or unauthorized" });

        res.status(200).json(deleted);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting review' });
    }
};