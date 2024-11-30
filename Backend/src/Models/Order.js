const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String,
    required: true  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Tourist', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Wallet', 'Credit Card', 'Cash on Delivery'], 
    required: true 
  },
  selectedAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  orderStatus: { 
    type: String, 
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Processing' 
  },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Remove existing indexes
if (mongoose.connection.models['Order']) {
  delete mongoose.connection.models['Order'];
}

const Order = mongoose.model('Order', orderSchema);

// Create new index
Order.collection.createIndex({ orderId: 1 }, { unique: true })
  .then(() => console.log('orderId index created'))
  .catch(err => console.log('Index creation error:', err));

module.exports = Order;
