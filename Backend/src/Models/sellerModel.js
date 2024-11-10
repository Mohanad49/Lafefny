const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sellerSchema = new Schema({
    name:{
        type: String,
        required: true,
    },  
    description: {
        type: String,
        required: true,
        unique: false, // Remove unique constraint since multiple sellers can have same description
    }, 
    userID:{
        type: mongoose.Schema.Types.ObjectId, // Change to ObjectId type
        required: true
    },
    logo: String,
    filename: String,
    contentType: String,
    data: Buffer,
});

module.exports = mongoose.model("Seller", sellerSchema);
