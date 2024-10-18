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
        unique: true,
      }, 
      userID:{
        type:String,
        required: true
      },
      logo: String,
      isAccepted: { type: Boolean, default: false },
      termsAccepted: { type: Boolean, default: false }
})

module.exports = mongoose.model("Seller", sellerSchema);
