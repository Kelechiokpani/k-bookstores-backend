const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true, versionKey: false });

// Ensure a user can only review a product once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);