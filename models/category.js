const mongoose=require("mongoose")
const {Schema}=mongoose

// models/category.js
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model("Category", categorySchema);