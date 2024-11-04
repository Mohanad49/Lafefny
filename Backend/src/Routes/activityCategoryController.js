const express = require('express');
const ActivityCategory = require('../Models/ActivityCategory');
const router = express.Router();

<<<<<<< HEAD
// CREATE activity
=======
// CREATE activity category
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.post('/', async (req, res) => {
  try {
    const activityCategory = new ActivityCategory(req.body);
    await activityCategory.save();
    res.status(201).json(activityCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

<<<<<<< HEAD
// READ all activities
=======
// READ all activities categories
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.get('/', async (req, res) => {
  try {
    const activitiesCategory = await ActivityCategory.find();
    res.status(200).json(activitiesCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
// UPDATE activity
=======
// UPDATE activity category
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.put('/:id', async (req, res) => {
  try {
    const activityCategory = await ActivityCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(activityCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

<<<<<<< HEAD
// DELETE activity
=======
// DELETE activity category
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.delete('/:id', async (req, res) => {
  try {
    await ActivityCategory.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;