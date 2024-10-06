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
});

const TouristItinerary = mongoose.model("TouristItinerary", TouristItinerarySchema);

module.exports = TouristItinerary;