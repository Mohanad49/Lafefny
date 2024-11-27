const express = require('express');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();
const Activity = require('../Models/Activity');
const TouristItinerary = require('../Models/Tourist-Itinerary');

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { username, email, password, dateOfBirth, mobileNumber, nationality, job, role, termsAccepted } = req.body;

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
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { deletionRequested: false },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Deletion request cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error cancelling deletion request', 
      error: error.message 
    });
  }
});

router.get('/users', async (req, res) => {
    let users = await User.find()
    return res.send(users).status(200)
});

// userController.js - Add this new route
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error.message 
    });
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