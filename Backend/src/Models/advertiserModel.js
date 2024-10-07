const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const AdvertiserSchema = new Schema({
  hotline:{
    type: Number,
    unique: true,
  },
  company:{
    type: String,
  },
  website:{
    type: String,
  },
  userID:{
    type:String,
    requried: true
  }
});


  

module.exports = mongoose.model("Advertiser", AdvertiserSchema);