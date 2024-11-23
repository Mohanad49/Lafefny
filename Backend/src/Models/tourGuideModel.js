const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const tourGuideSchema = new Schema({
  mobile:{
    type: Number,
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
  },
  filename: String,
  contentType: String,
  data: Buffer,
});

module.exports = mongoose.model("TourGuide", tourGuideSchema);
