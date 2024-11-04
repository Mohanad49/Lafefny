const express = require('express');
const PreferenceTag = require('../Models/PreferenceTag');
const router = express.Router();

<<<<<<< HEAD
// CREATE activity
=======
// CREATE tag
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.post('/', async (req, res) => {
  try {
    const preferenceTag = new PreferenceTag(req.body);
    await preferenceTag.save();
    res.status(201).json(preferenceTag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

<<<<<<< HEAD
// READ all activities
=======
// READ all tags
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.get('/', async (req, res) => {
  try {
    const preferenceTag = await PreferenceTag.find();
    res.status(200).json(preferenceTag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
// UPDATE activity
=======
// UPDATE tag
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.put('/:id', async (req, res) => {
  try {
    const preferenceTag = await PreferenceTag.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(preferenceTag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

<<<<<<< HEAD
// DELETE activity
=======
// DELETE tag
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2
router.delete('/:id', async (req, res) => {
  try {
    await PreferenceTag.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;