const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');


// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// GET a single product by ID
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

// Route to view products with filters
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
  const { name, imageUrl, price, quantity, description } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product details
    if (name) product.name = name;
    if (imageUrl) product.imageUrl = imageUrl;
    if (price) product.price = price;
    if (quantity) product.quantity = quantity;
    if (description) product.description = description;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
