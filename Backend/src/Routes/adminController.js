const express = require('express');
const router = express.Router();
const User = require('../Models/User');

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
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const tourismGovernor = new User({
      username,
      password,
      role: 'Tourism governor'
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

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const admin = new User({
      username,
      password,
      role: 'Admin'
    });

    await admin.save();
    res.json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding Admin', error });
  }
});

module.exports = router;
