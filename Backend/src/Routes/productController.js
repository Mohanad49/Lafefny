const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const Tourist = require('../Models/touristModel');
const Notification = require('../Models/notificationModel');
const User = require('../Models/User');
const { sendOutOfStockEmail } = require('../Services/emailService');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Add this new route for toggling archive status
router.patch('/:id/toggleArchive', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.isArchived = !product.isArchived;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user has purchased product (make sure this route comes BEFORE any other routes with :id)
router.get('/check-purchase/:userID/:productId', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userID });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const hasPurchased = tourist.purchasedProducts.some(id => 
      id.toString() === req.params.productId
    );
    
    res.json({ 
      hasPurchased,
      touristName: tourist.name 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single product by ID (move this AFTER the check-purchase route)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Route to view products with filters (move this after the ID routes)
router.get('/filter', async (req, res) => {
  const { name, minPrice, maxPrice, sortBy } = req.query;

  try {
      let query = {};
      // Search by name
      if (name) {
          query.name = { $regex: name, $options: 'i' }; // Case insensitive search
      }

      // Filter by price
      if (minPrice || maxPrice) {
          query.price = {};
          if (minPrice) query.price.$gte = Number(minPrice);
          if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // Fetch products based on the query
      let products = await ProductsModel.find(query);

      // Sort by rating if specified
      if (sortBy === 'rating') {
          products = products.sort((a, b) => b.ratings.averageRating - a.ratings.averageRating);
      }

      res.json(products);
  } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
  }
});

// Route to add a product (accessible by admins or sellers)
router.post('/', async (req, res) => {

  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Route to edit a product's details (accessible by admins or sellers)
router.put('/:id', async (req, res) => {
  const { name, imageUrl, price, quantity, description, ownerID } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product details
    if (name) product.name = name;
    if (imageUrl) product.imageUrl = imageUrl;
    if (price) product.price = price;
    if (quantity !== undefined) {
      product.quantity = quantity;
      
      // Add debug logging
      console.log('Quantity update:', {
        newQuantity: quantity,
        ownerID: product.ownerID
      });
      
      // Check if product is out of stock
      if (parseInt(quantity) === 0) {
        console.log('Product out of stock, sending notification...');
        
        try {
          // Get owner's user record
          const owner = await User.findById(product.ownerID);
          if (!owner) {
            console.error('Owner not found:', product.ownerID);
            return res.status(404).json({ message: "Product owner not found" });
          }

          // Create notification
          const notification = new Notification({
            recipient: product.ownerID,
            recipientModel: owner.role,
            message: `Your product "${product.name}" is out of stock`,
            type: 'OUT_OF_STOCK',
            productId: product._id
          });
          
          await notification.save();
          console.log('Notification saved:', notification);

          // Send email
          if (owner.email) {
            await sendOutOfStockEmail(owner.email, product.name);
            console.log('Email sent to:', owner.email);
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Continue with product update even if notification fails
        }
      }
    }
    if (description) product.description = description;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ message: err.message });
  }
});

// Add a review to a product
router.post('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newReview = {
      reviewerName: req.body.reviewerName,
      rating: req.body.rating,
      comment: req.body.comment,
      date: req.body.date
    };

    product.ratings.reviews.push(newReview);

    // Update average rating
    const totalRating = product.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.ratings.averageRating = totalRating / product.ratings.reviews.length;
    product.ratings.totalRatings = product.ratings.reviews.length;

    await product.save();
    res.json({ ratings: product.ratings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/wishlist/:userID', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userID });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const { productId } = req.body;
    
    // Check if product already in wishlist
    if (!tourist.wishlist.includes(productId)) {
      tourist.wishlist.push(productId);
      await tourist.save();
    }

    res.json({ message: "Added to wishlist successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to cart
router.post('/cart/:userID', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userID });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const { productId, quantity } = req.body;
    
    // Check if product already in cart
    const existingCartItem = tourist.cart.find(item => 
      item.productId.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      tourist.cart.push({ productId, quantity });
    }

    await tourist.save();
    res.json({ message: "Added to cart successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
