const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: false, default: null },
  mobileNumber: { type: String },
  nationality: { type: String },
  job: { type: String },
  role: { type: String, enum: ['Tourist', 'TourGuide', 'Advertiser', 'Seller', 'Admin'], default: 'Tourist' },
  picture: String,
  isAccepted: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: true },
  deletionRequested: { type: Boolean, default: false },
  promoCodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
