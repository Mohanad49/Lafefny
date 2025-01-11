const express = require('express');
const Complaint = require('../Models/Complaint');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/', async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    const complaint = new Complaint({ userId, title, body });
    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully' });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Error submitting complaint', error });
  }
});

// Get all complaints, with optional sorting by date
router.get('/', async (req, res) => {
    try {
      const { sort = 'desc' } = req.query; // Sort by date descending by default
      const complaints = await Complaint.find().sort({ date: sort === 'asc' ? 1 : -1 });
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({ message: 'Error fetching complaints' });
    }
  });
  
  // Get a specific complaint by ID
  router.get('/:id', async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      res.json(complaint);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      res.status(500).json({ message: 'Error fetching complaint' });
    }
  });
  
  // Update a complaint's status or admin reply
  router.put('/:id', async (req, res) => {
    try {
      const { status, adminReply } = req.body;
      const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        { status, adminReply },
        { new: true }
      );
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      res.json({ message: 'Complaint updated successfully', complaint });
    } catch (error) {
      console.error('Error updating complaint:', error);
      res.status(500).json({ message: 'Error updating complaint' });
    }
  });

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.userId);
    const complaints = await Complaint.find({ userId })
      .sort({ date: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

module.exports = router;