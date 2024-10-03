const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String , required: true},
    imageUrl: String, 
    price: {type: Number, required: true},
    quantity: Number, 
    description: String,
    seller: String,
    ratings: {
      averageRating: {type: Number , default: 0},
      totalRatings: { type: Number, default: 0 },
      reviews: [
        {
          reviewerName: String,
          rating: Number,
          comment: String,
          date: Date
        } 
      ], default: []
    }
  });
  
  const Product = mongoose.model('Product', productSchema);
  module.exports = Product;
  