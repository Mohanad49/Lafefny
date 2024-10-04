const mongoose = require('mongoose');

const TourismGovernorSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

const TourismGovernor = mongoose.model('TourismGovernor', TourismGovernorSchema);
module.exports = TourismGovernor;