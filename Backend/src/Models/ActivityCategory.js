const mongoose = require('mongoose');

const activityCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: {type: String, required: true}
 
});

module.exports = mongoose.model('ActivityCategory', activityCategorySchema);