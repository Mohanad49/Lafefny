const mongoose = require('mongoose');

const museumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  pictures: [{ type: String }], // Array of image URLs
  location: { type: String, required: true },
  openingHours: { type: String, required: true },
  ticketPrices: {
    foreigner: { type: Number, required: true },
    native: { type: Number, required: true },
    student: { type: Number, required: true },
  }
}, { timestamps: true });

const Museum = mongoose.model('Museum', museumSchema);
module.exports = Museum;