const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date },
  mobileNumber: { type: String },
  nationality: { type: String },
  job: { type: String },
  role: { type: String, enum: ['Tourist', 'TourGuide', 'Advertiser', 'Seller', 'Admin'], default: 'Tourist' },
  documents: [{
    file: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    description: String
  }],
  picture: String,
  isAccepted: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  deletionRequested: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
