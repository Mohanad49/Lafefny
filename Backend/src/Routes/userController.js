const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const TourismGovernor = require('../Models/TourismGovernor');
const Admin = require('../Models/Admin');
const PromoCode = require('../Models/PromoCode');
// Delete Account (any user)
router.delete('/delete-account/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error });
  }
});

// Add Tourism Governor
router.post('/add-tourism-governor', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await TourismGovernor.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const tourismGovernor = new TourismGovernor({
      username,
      password,
    });
    await tourismGovernor.save();
    res.json({ message: 'Tourism Governor added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding Tourism Governor', error });
  }
});

// Add Another Admin
router.post('/add-admin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and Password are required' });
  }
  
  try {
    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const admin = new Admin({
      username,
      password,
    });

    await admin.save();
    res.json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding Admin', error });
  }
});



//turn accept on/////////////////////////////////////////////////////
router.put('/accept/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isAccepted: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User accepted', user });
  } catch (error) {
    console.error(error); // Log the error to help with debugging
    res.status(500).json({ message: 'Failed to accept user', error: error.message });
  }
});

router.put('/reject/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isAccepted: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User rejected', user });
  } catch (error) {
    console.error(error); // Log the error to help with debugging
    res.status(500).json({ message: 'Failed to reject user', error: error.message });
  }
});

// Create Promo Code
router.post('/promo-codes', async (req, res) => {
  const { code, discountPercentage, validUntil, maxUses } = req.body;

  try {
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      discountPercentage,
      validUntil,
      maxUses
    });

    await promoCode.save();
    res.status(201).json({ message: 'Promo code created successfully', promoCode });
  } catch (error) {
    res.status(500).json({ message: 'Error creating promo code', error });
  }
});

// Get All Promo Codes
router.get('/promo-codes', async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.json(promoCodes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching promo codes', error });
  }
});

// Deactivate Promo Code
router.put('/promo-codes/:id/deactivate', async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    res.json({ message: 'Promo code deactivated', promoCode });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating promo code', error });
  }
});

// Create User
router.post('/users', async (req, res) => {
  const { username, email, password, dateOfBirth } = req.body;

  // Validate required fields
  if (!username || !email || !password || !dateOfBirth) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new user
    const user = new User({
      username,
      email,
      password, // Ensure to hash this in production
      dateOfBirth, // Use the birthday provided by the user
      promoCodes: []
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

module.exports = router;