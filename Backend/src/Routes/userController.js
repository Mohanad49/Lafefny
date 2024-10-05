const express = require('express');
const User = require('../Models/User');  // Import the User model
const router = express.Router();

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { username, email, password, dateOfBirth, mobileNumber, nationality, job, role } = req.body;

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

router.get('/users', async (req, res) => {
    let users = await User.find()
    return res.send(users).status(200)
});

module.exports = router;