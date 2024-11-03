const mongoose = require('mongoose');

const touristSchema = new mongoose.Schema({
  userID:{
    type:String,
    required:true
  },
  wallet:{
    type:Number,
    default: 0
  },
  preferences: [{ type: String , default: []}],
  loyaltyPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badge: { type: String, default: 'Bronze' },
  flightBookings: [{
    airline: { type: String,  default: '' },
    flightNumber: { type: String, default: '' },
    departureDate: { type: Date, default: Date.now },
    arrivalDate: { type: Date, default: Date.now },
    departureAirport: { type: String, default: '' },
    arrivalAirport: { type: String, default: '' },
    seatNumber: { type: String, default: '' },
    bookingStatus: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' },
    price: { type: Number, default: 0 },
    default: []
  }],
  hotelBookings: [{
    hotelName: { type: String, default: '' },
    roomType: { type: String, default: '' },
    checkInDate: { type: Date, default: Date.now },
    checkOutDate: { type: Date, default: Date.now },
    numberOfGuests: { type: Number, default: 0 },
    bookingStatus: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' },
    price: { type: Number, default: 0 },
    default: []
  }],
  transportationBookings: [{
    type: { type: String, enum: ['Car', 'Bus', 'Train', 'Other'] },
    providerName: { type: String, default: '' },
    bookingNumber: { type: String, default: '' },
    departureLocation: { type: String, default: '' },
    arrivalLocation: { type: String, default: '' },
    departureDate: { type: Date, default: Date.now },
    arrivalDate: { type: Date, default: Date.now },
    numberOfPassengers: { type: Number, default: 0 },
    bookingStatus: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' },
    price: { type: Number, default: 0 },
    default: []
  }],
  bookedActivities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    default: []
  }],
  bookedItineraries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TouristItinerary',
    default: []
  }],
  purchasedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: []
  }]
}, { timestamps: true });

const User = mongoose.model('Tourist', touristSchema);

module.exports = User;