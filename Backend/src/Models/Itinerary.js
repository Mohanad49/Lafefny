const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  activities: [{ type: String, required: true }],
  locations: [{ type: String, required: true }],
  timeline: [{ type: String, required: true }],
  duration: [{ type: Number, required: true }], // duration in hours
  language: { type: String, required: true },
  price: { type: Number, required: true },
  availableDates: [{ type: Date, required: true }],
  accessibility: { type: String, required: true },
  pickUpLocation: { type: String, required: true },
  dropOffLocation: { type: String, required: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }], // Reference to bookings
  ratings: { type: Number , default: 0},
  preferences: { type: String, default: '' },
}, { timestamps: true });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);
module.exports = Itinerary;