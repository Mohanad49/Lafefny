const mongoose = require('mongoose');

const PreferenceTagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: {type: String, required: true}
 
});

module.exports = mongoose.model('PreferenceTag', PreferenceTagSchema);