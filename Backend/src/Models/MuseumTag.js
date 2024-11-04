const mongoose = require('mongoose');

const museumTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Monuments', 'Museums', 'Religious Sites', 'Palaces/Castles'],
  },
  historicalPeriod: {
    type: String,
  },
});

const MuseumTag = mongoose.model('MuseumTag', museumTagSchema);
module.exports = MuseumTag;