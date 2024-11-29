const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxUses: {
    type: Number,
    default: null
  },
  currentUses: {
    type: Number,
    default: 0
  },
 
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', PromoCodeSchema);