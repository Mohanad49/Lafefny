const express = require('express');
const MuseumTag = require('../Models/MuseumTag');

// Initialize the router
const router = express.Router();

// Create a new tag (Controller logic)
router.post('/', async (req, res) => {
  try {
    const newTag = new MuseumTag(req.body);
    await newTag.save();
    res.status(201).json(newTag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tags (Controller logic)
router.get('/', async (req, res) => {
  try {
    const tags = await MuseumTag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export the router to be used in the main app
module.exports = router;