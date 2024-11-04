const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const tourGuideSchema = new Schema({
  mobile:{
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
    required: true
  },
  picture: String,
  isAccepted: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  ratings: {
    averageRating: {type: Number , default: 0},
    totalRatings: { type: Number, default: 0 },
    reviews: [
      {
        reviewerName: {type: String, default: ''},
        rating: {type: Number, default: 0},
        comment: {type: String, default: ''},
        date: {type: Date, default: Date.now}
      } 
    ], default: []
  }
});


  

module.exports = mongoose.model("TourGuide", tourGuideSchema);
