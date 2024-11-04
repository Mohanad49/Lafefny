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
    required: true
  },
  logo: String,
  isAccepted: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false }
});


  

module.exports = mongoose.model("Advertiser", AdvertiserSchema);
