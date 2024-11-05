const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const TourismGovernor = require('../Models/TourismGovernor');
const Admin = require('../Models/Admin');

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

module.exports = router;
