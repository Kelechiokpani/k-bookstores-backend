const mongoose=require("mongoose")
const {Schema}=mongoose

// models/Category.js
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model("Category", categorySchema);