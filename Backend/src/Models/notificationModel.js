const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['TourGuide', 'Advertiser', 'Seller', 'Admin', 'Tourist'] // Added Tourist
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['INAPPROPRIATE_FLAG', 'OUT_OF_STOCK', 'EVENT_REMINDER'] // Add reminder type
  },
  eventType: {
    type: String,
    enum: ['ACTIVITY', 'ITINERARY', 'TOURIST_ITINERARY'],
    required: function() { return this.type === 'EVENT_REMINDER'; }
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'eventType'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Notification', notificationSchema);