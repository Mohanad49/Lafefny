const express = require("express");
const TouristItinerary = require("../Models/Tourist-Itinerary");
const router = express.Router();

// CREATE a new itinerary
router.post("/", async (req, res) => {
    try {
      const { name, activities, locations, tags, startDate, endDate, price, touristName, ratings, preferences, language } = req.body;
      
      // Check if the date range is valid
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: "Start date cannot be after end date" });
      }
  
      const newItinerary = new TouristItinerary({
        name,
        activities,
        locations,
        tags,
        startDate,
        endDate,
        price,
        touristName,
        ratings,
        preferences,
        language
      });
  
      await newItinerary.save();
      res.status(201).json(newItinerary);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
// READ all itineraries
router.get("/", async (req, res) => {
  try {
    const itineraries = await TouristItinerary.find();
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET an itinerary by ID
router.get("/:id", async (req, res) => {
  try {
      const itinerary = await TouristItinerary.findById(req.params.id);
      if (!itinerary) {
          return res.status(404).json({ error: "Itinerary not found" });
      }
      res.json(itinerary);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// UPDATE an itinerary by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, activities, locations, tags, startDate, endDate, price, touristName, ratings, preferences, language } = req.body;

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: "Start date cannot be after end date" });
    }

    const updatedItinerary = await TouristItinerary.findByIdAndUpdate(
      req.params.id,
      { name, activities, locations, tags, startDate, endDate, price, touristName, ratings, preferences, language },
      { new: true }
    );

    if (!updatedItinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    res.json(updatedItinerary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE an itinerary by ID
router.delete("/:id", async (req, res) => {
  try {
    const itinerary = await TouristItinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }
    
    await itinerary.remove();
    res.json({ message: "Itinerary deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/book', async (req, res) => {
  try {
    const { userId } = req.body; // Expecting userId in the request body

    // Find the itinerary to be booked
    const itinerary = await TouristItinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Check if user has already booked this itinerary
    if (itinerary.touristBookings.includes(userId)) {
      return res.status(400).json({ error: "User has already booked this itinerary" });
    }

    // Add user to bookings
    itinerary.touristBookings.push(userId);
    await itinerary.save();

    res.status(200).json({ message: "Booking successful", itinerary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking for an itinerary
router.post('/:id/cancel', async (req, res) => {
  try {
    const { userId } = req.body; // Expecting userId in the request body

    const itinerary = await TouristItinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Check if user has booked this itinerary
    const bookingIndex = itinerary.touristBookings.indexOf(userId);
    if (bookingIndex === -1) {
      return res.status(400).json({ error: "Booking not found for this user" });
    }

    // Remove user from bookings
    itinerary.touristBookings.splice(bookingIndex, 1);
    await itinerary.save();

    res.status(200).json({ message: "Booking canceled successfully", itinerary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;