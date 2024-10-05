const express = require('express');
const PreferenceTag = require('../Models/PreferenceTag');
const router = express.Router();

// CREATE activity
router.post('/', async (req, res) => {
  try {
    const preferenceTag = new PreferenceTag(req.body);
    await preferenceTag.save();
    res.status(201).json(preferenceTag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all activities
router.get('/', async (req, res) => {
  try {
    const preferenceTag = await PreferenceTag.find();
    res.status(200).json(preferenceTag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE activity
router.put('/:id', async (req, res) => {
  try {
    const preferenceTag = await PreferenceTag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(preferenceTag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE activity
router.delete('/:id', async (req, res) => {
  try {
    await PreferenceTag.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;