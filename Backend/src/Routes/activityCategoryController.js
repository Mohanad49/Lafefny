const express = require('express');
const ActivityCategory = require('../Models/ActivityCategory');
const router = express.Router();

// CREATE activity category
router.post('/', async (req, res) => {
  try {
    const activityCategory = new ActivityCategory(req.body);
    await activityCategory.save();
    res.status(201).json(activityCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all activities categories
router.get('/', async (req, res) => {
  try {
    const activitiesCategory = await ActivityCategory.find();
    res.status(200).json(activitiesCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE activity category
router.put('/:id', async (req, res) => {
  try {
    const activityCategory = await ActivityCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(activityCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE activity category
router.delete('/:id', async (req, res) => {
  try {
    await ActivityCategory.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;