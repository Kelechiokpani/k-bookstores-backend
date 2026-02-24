const mongoose=require("mongoose")
const {Schema}=mongoose

// models/brand.js
const brandSchema = new Schema({
    name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model("Brand", brandSchema);