const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const tourGuideSchema = new Schema({
  moblie:{
    type: Number,
    unique: true,
  },
  yearsOfExperience:{
    type: Number,
  },
  previousWork:{
    type: String,
  },
  userID:{
    type:String,
    requried: true
  }
});


  

module.exports = mongoose.model("TourGuide", tourGuideSchema);