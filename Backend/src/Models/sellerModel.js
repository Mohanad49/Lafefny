const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const sellerSchema = new Schema({
    name:{
        type: String,
        requried: true,
        
      },  
      description: {
        type: String,
        requried: true,
        unique: true,
      }, 
      userID:{
        type:String,
        requried: true
      }
})

module.exports = mongoose.model("Seller", sellerSchema);