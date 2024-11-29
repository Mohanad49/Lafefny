const express = require('express');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();
const User = require('../Models/User');
const TourismGovernor = require('../Models/TourismGovernor');
const Admin = require('../Models/Admin');
const PromoCode = require('../Models/PromoCode');
// Delete Account (any user)
router.delete('/delete-account/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, email, password, dateOfBirth, mobileNumber, nationality, job, role });
    await newUser.save();
    
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      id: newUser._id,
      token 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error signing up', error: err.message });
  }
});

// Sign In Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is accepted
    if (!user.isAccepted) {
      return res.status(403).json({ message: 'Your account is pending approval' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Error signing in', error: err.message });
  }
});

// Change Password Route
router.put('/change-password/:id', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update only the password field
    await User.findByIdAndUpdate(userId, { password: newPassword }, { 
      new: true,
      runValidators: false // Disable validation for other fields
    });

    // Send success response
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ 
      message: 'Error changing password', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Delete Account Route for Sellers
router.delete('/seller-delete/:id', auth, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting account', error: err.message });
  }
});

// Delete Account Route
router.put('/request-deletion/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has a pending deletion request
    if (user.deletionRequested) {
      return res.status(400).json({ 
        message: 'You already have a pending deletion request' 
      });
    }

    // Check for upcoming bookings based on user role
    const today = new Date();
    let canDelete = true;
    let message = '';

    if (user.role === 'Tourist') {
      try {
        const bookedActivities = await Activity.find({
          touristBookings: userId,
          date: { $gt: today }
        });
        
        const bookedItineraries = await TouristItinerary.find({
          touristBookings: userId,
          endDate: { $gt: today }
        });

        if (bookedActivities.length > 0 || bookedItineraries.length > 0) {
          canDelete = false;
          message = 'Cannot request deletion - you have upcoming bookings';
        }
      } catch (error) {
        console.error('Error checking bookings:', error);
        return res.status(500).json({ 
          message: 'Error checking upcoming bookings',
          error: error.message 
        });
      }
    }

    if (!canDelete) {
      return res.status(400).json({ message });
    }

    // Update deletionRequested flag
    user.deletionRequested = true;
    await user.save();
    
    return res.status(200).json({ 
      message: 'Account deletion request submitted successfully' 
    });

  } catch (error) {
    console.error('Error in request-deletion:', error);
    return res.status(500).json({ 
      message: 'Error requesting account deletion', 
      error: error.message 
    });
  }
});

router.put('/cancel-deletion/:userId', auth, async (req, res) => {
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

// Protected route example
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

module.exports = router;