const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [{
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true } // Price at time of purchase
    }],
    totalAmount: { type: Number, required: true },
    address: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    status: { type: String, default: "pending", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
    paymentMethod: { type: String, required: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Order", orderSchema);