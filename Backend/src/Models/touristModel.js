const mongoose = require('mongoose');

const touristSchema = new mongoose.Schema({
  userID:{
    type:String,
    required:true
  },
  wallet:{
    type:Number
  }
}, { timestamps: true });

const User = mongoose.model('Tourist', touristSchema);

module.exports = User;