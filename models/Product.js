const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    discountPercentage: { type: Number, default: 0 },
    stockQuantity: { type: Number, required: true, default: 0 },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    thumbnail: { type: String, required: true },
    images: { type: [String], required: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Product", productSchema);