const mongoose = require('mongoose');

// Define the Address Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false }); // Prevents creating a separate _id for each address

// Define the Tourist Schema
const touristSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  wallet: { type: Number, default: 0 },
  preferences: [{ type: String, default: [] }],
  loyaltyPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badge: { type: String, default: 'Bronze' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: [] }],
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  flightBookings: [{
    airline: { type: String, default: '' },
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
    departureLocation: { type: String, default: '' },
    arrivalLocation: { type: String, default: '' },
    departureDate: { type: Date, default: Date.now },
    arrivalDate: { type: Date, default: Date.now },
    numberOfPassengers: { type: Number, default: 0 },
    bookingStatus: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' },
    price: { type: Number, default: 0 },
    default: []
  }],
  bookedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity', default: [] }],
  bookedItineraries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TouristItinerary', default: [] }],
  purchasedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: [] }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: [] }], // Reference to orders
  addresses: { type: [addressSchema], default: [] } // New field for addresses
}, { timestamps: true });

const User = mongoose.model('Tourist', touristSchema);
module.exports = User;
