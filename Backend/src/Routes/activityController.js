const express = require('express');
const Activity = require('../Models/Activity');
const router = express.Router();

// CREATE activity
router.post('/', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ activity by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.status(200).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE activity
router.put('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE activity
router.delete('/:id', async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View upcoming activities including historical events and museums
router.get('/upcomingActivities', async (req, res) => {
  try {
      const activities = await activityModel.find({
          date: { $gt: new Date() } // Only fetch future activities
      }).sort({ date: 1 }); // Sort by ascending date

      res.status(200).json(activities);

  } catch (error) {
      res.status(500).json({ message: "Error fetching upcoming activities", error });
  }
});

// Router to search activities
router.get('/searchActivities', async (req, res) => {
  try {
      const { keyword } = req.query; // The keyword to search for
      
      // Build a query to search in 'name', 'category', and 'tags' fields
      const query = {
          $or: [
              { name: { $regex: keyword, $options: 'i' } },      // Case-insensitive match in name
              { category: { $regex: keyword, $options: 'i' } },  // Case-insensitive match in category
              { tags: { $regex: keyword, $options: 'i' } }       // Case-insensitive match in tags
          ]
      };

      // Search in the activities collection
      const activities = await activityModel.find(query);
      res.status(200).json(activities);

  } catch (error) {
      res.status(500).json({ message: "Error performing activity search", error });
  }
});


// Filter Activities
router.get('/filterActivities', async (req, res) => {
  try {
      const { price, date, category, rating } = req.query;

      // Build the query object dynamically based on provided filters
      const query = {
          date: { $gt: new Date() } // Only fetch future activities by default
      };

      // Apply price filter if provided
      if (price) {
          query.price = { $lte: Number(price) }; // Assuming 'price' is stored as a number
      }

      // Apply date filter if provided
      if (date) {
          query.date = { $eq: new Date(date) }; // Matches the specific date
      }

      // Apply category filter if provided
      if (category) {
          query.category = category; // Matches the category exactly
      }

      // Apply rating filter if provided
      if (rating) {
          query.rating = { $gte: Number(rating) }; // Assuming 'rating' is stored as a number
      }

      // Fetch the filtered activities
      const activities = await activityModel.find(query).sort({ date: 1 });

      // Return the filtered activities
      res.status(200).json(activities);

  } catch (error) {
      // Handle any errors during fetching
      res.status(500).json({ message: "Error fetching activities based on filters", error });
  }
});


// Router to sort upcoming activities
router.get('/sortActivities', async (req, res) => {
  try {
      const allowedSortFields = ['price', 'rating'];
      const { sortBy } = req.query;

      // Validate the sortBy field, use 'price' as the default if not provided or invalid
      if (!sortBy || !allowedSortFields.includes(sortBy)) {
          return res.status(400).json({ message: `Invalid sortBy value. Allowed values: ${allowedSortFields.join(', ')}` });
      }

      // Fetch upcoming activities sorted by the chosen field in ascending order
      const activities = await activityModel.find({
          date: { $gt: new Date() } // Only fetch future activities
      }).sort({ [sortBy]: 1 }); // Sort in ascending order

      // Return sorted activities
      res.status(200).json(activities);

  } catch (error) {
      // Handle any errors during fetching
      res.status(500).json({ message: "Error sorting activities", error });
  }
});


module.exports = router;
