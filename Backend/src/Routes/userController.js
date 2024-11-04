const express = require('express');
//const bcrypt = require('bcryptjs');
const User = require('../Models/User');  // Import the User model
const router = express.Router();

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { username, email, password, dateOfBirth, mobileNumber, nationality, job, role , termsAccepted  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    

    // Create and save new user
    const newUser = new User({ username, email, password, dateOfBirth, mobileNumber, nationality, job, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
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
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      });
  } catch (err) {
    res.status(500).json({ message: 'Error signing in', error: err.message });
  }
});


// Change Password Route
router.put('/change-password/:id', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id; // Assuming userId is available after authentication
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

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err.message });
  }
});


router.get('/users', async (req, res) => {
    let users = await User.find()
    return res.send(users).status(200)
});

module.exports = router;