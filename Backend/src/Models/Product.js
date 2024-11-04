const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String , required: true},
    imageUrl: String, 
    price: {type: Number, required: true},
    quantity: {type: Number, required: true, default: 0},
    sales: {type: Number, default: 0},
    description: String,
    seller: {
      type: String,  
      required: true
    },
    isArchived: {type: Boolean, default: false},
    ratings: {
      averageRating: {type: Number , default: 0},
      totalRatings: { type: Number, default: 0 },
      reviews: [
        {
          reviewerName: {type: String, default: ''},
          rating: {type: Number, default: 0},
          comment: {type: String, default: ''},
          date: {type: Date, default: Date.now}
        } 
      ], default: []
    }
  });
  
  const Product = mongoose.model('Product', productSchema);
  module.exports = Product;
