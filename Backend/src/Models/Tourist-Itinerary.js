const mongoose = require("mongoose");

const TouristItinerarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  activities: [{ type: String, required: true }],
  locations: [{ type: String, required: true }],
  tags: [String],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
  touristName: { type: String, required: true },
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
  preferences: { type: String, default: '' },
  language: { type: String, default: '' },
  tourGuideName: { type: String, default: '' },
  touristBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    default: []
  }],
  paidBy: [{ type: mongoose.Schema.Types.ObjectId,
  ref: 'Tourist' }],
  default: []
});

const TouristItinerary = mongoose.model("TouristItinerary", TouristItinerarySchema);

module.exports = TouristItinerary;