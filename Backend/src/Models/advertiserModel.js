const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const AdvertiserSchema = new Schema({
  hotline:{
    type: Number
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
  filename: String,
  contentType: String,
  data: Buffer,
  touristBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    default: []
  }]
});


  

module.exports = mongoose.model("Advertiser", AdvertiserSchema);
