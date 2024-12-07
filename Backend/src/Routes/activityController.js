const express = require('express');
const mongoose = require('mongoose');
const Tourist= require("../Models/touristModel");
const Activity = require('../Models/Activity');
const User = require('../Models/User');
const { updateLoyaltyPoints, decreaseLoyaltyPoints } = require('./loyaltyPoints');
const Notification = require('../Models/notificationModel');
const { sendInappropriateContentEmail } = require('../Services/emailService');
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
      const activities = await Activity.find({
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
      const activities = await Activity.find(query);
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
      const activities = await Activity.find(query).sort({ date: 1 });

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
      const activities = await Activity.find({
          date: { $gt: new Date() } // Only fetch future activities
      }).sort({ [sortBy]: 1 }); // Sort in ascending order

      // Return sorted activities
      res.status(200).json(activities);

  } catch (error) {
      // Handle any errors during fetching
      res.status(500).json({ message: "Error sorting activities", error });
  }
});

// Booking route for an activity
// Booking route for an activity
router.post('/:activityId/book', async (req, res) => {
  try {
    const { touristId } = req.body;
    console.log("Tourist ID:", touristId); // Log touristId for debugging

    const tourist = await User.findById(touristId);
    if (!tourist || tourist.role !== 'Tourist') {
      return res.status(400).json({ error: "Invalid tourist ID or user is not a tourist" });
    }

    const activity = await Activity.findById(req.params.activityId);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    if (!activity.bookingOpen) {
      return res.status(400).json({ error: "This activity is not open for booking" });
    }


    activity.touristBookings.push(touristId);
    await activity.save();
    updateLoyaltyPoints(touristId, activity.price); // Update loyalty points for the tourist
    res.status(200).json({ message: "Booking successful", activity });
  } catch (error) {
    console.error("Error in booking route:", error); // Log detailed error for debugging
    res.status(500).json({ error: error.message });
  }
});



// Cancel booking for an activity
router.post('/:id/cancel', async (req, res) => {
  try {
    const { touristId } = req.body;
    tourist = await Tourist.findOne({ userID: touristId });
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const bookingIndex = activity.touristBookings.indexOf(touristId);
    const paidByIndex = activity.paidBy.indexOf(touristId);

    if (bookingIndex === -1 && paidByIndex === -1) {
      return res.status(400).json({ error: "Booking not found for this tourist" });
    }

    if (bookingIndex !== -1) {
      activity.touristBookings.splice(bookingIndex, 1);
    }

    if (paidByIndex !== -1) {
      activity.paidBy.splice(paidByIndex, 1);
    }

    await activity.save();
    tourist.wallet += activity.price;
    await tourist.save();
    const remainingBalance = tourist.wallet;
    decreaseLoyaltyPoints(touristId, activity.price); // Decrease loyalty points for the tourist
    res.status(200).json({ message: "Booking canceled successfully", activity, remainingBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/toggleInappropriate', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    activity.inappropriateFlag = !activity.inappropriateFlag;
    await activity.save();

    if (activity.inappropriateFlag) {
      // Create notification for owner
      await Notification.create({
        recipient: activity.advertiser,
        recipientModel: 'Advertiser',
        message: `Your activity "${activity.name}" has been flagged as inappropriate`,
        type: 'INAPPROPRIATE_FLAG'
      });
      const user = await User.findById(activity.advertiser);
      // Send email
      await sendInappropriateContentEmail(
        user.email,
        'activity',
        activity.name
      );
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/advertiser/:id', async (req, res) => {
  const advertiserId = req.params.id;
  
  // Validate advertiser ID
  if (!mongoose.isValidObjectId(advertiserId)) {
      return res.status(400).json({ error: "Invalid advertiser ID" });
  }

  try {
      const activities = await Activity.find({ advertiser: advertiserId });
      
      if (!activities.length) {
          return res.status(404).json({ message: "No activities found for this advertiser" });
      }

      res.status(200).json(activities);
  } catch (error) {
      res.status(500).json({ 
          error: "Error fetching activities",
          details: error.message 
      });
  }
});

module.exports = router;
