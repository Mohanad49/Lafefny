const mongoose = require('mongoose');

const TourismGovernorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const TourismGovernor = mongoose.model('TourismGovernor', TourismGovernorSchema);
module.exports = TourismGovernor;