const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true }, // Can be coordinates, use Google Maps API on frontend
  price: { type: Number, required: true },
  category: { type: String, required: true },
  tags: { type: [String], required: true },
  specialDiscounts: { type: String }, // Could be a percentage or other details
  bookingOpen: { type: Boolean, required: true },
  inappropriateFlag: { type: Boolean, default: false },
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
  touristBookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tourist',
    default: []
  }]
});

module.exports = mongoose.model('Activity', activitySchema);
