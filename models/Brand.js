const mongoose=require("mongoose")
const {Schema}=mongoose

// models/Brand.js
const brandSchema = new Schema({
    name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model("Brand", brandSchema);