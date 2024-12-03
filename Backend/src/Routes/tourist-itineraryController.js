const express = require("express");
const TouristItinerary = require("../Models/Tourist-Itinerary");
const Itinerary = require("../Models/Itinerary");
const Tourist = require("../Models/touristModel");
const User = require("../Models/User");
const router = express.Router();
const { updateLoyaltyPoints, decreaseLoyaltyPoints } = require('./loyaltyPoints');
const { processCardPayment } = require('../Services/payingService');
const { sendReceiptEmail } = require('../Services/emailService');

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

  router.post('/:itineraryId/payment', async (req, res) => {
    const { itineraryId } = req.params;
    const { method, paymentMethodId, touristId, amount } = req.body;
    try {
      console.log('Received payment request');
      console.log('itineraryIdd:', itineraryId);
      console.log('method:', method);
      console.log('paymentMethodId:', paymentMethodId);
      console.log('touristId:', touristId);
      console.log('amount:', amount);
  
      const itinerary = await Itinerary.findById(itineraryId);
      if (!itinerary) {
        console.error('Itinerary not found');
        return res.status(404).json({ error: 'Itinerary not found' });
      }
  
      //Check if the user has already paid for this itinerary
      // if (itinerary.paidBy.includes(touristId)) {
      //   return res.status(400).json({ error: 'You have already paid for this itinerary' });
      // }
  
      let tourist;
      if (method === 'card') {
        const paymentResult = await processCardPayment(paymentMethodId, amount);
        if (!paymentResult.success) {
          console.error('Card payment failed:', paymentResult.error);
          throw new Error(paymentResult.error);
        }
        tourist = await Tourist.findOne({ userID: touristId });
        if (!tourist) {
          console.error('Tourist not found');
          return res.status(404).json({ error: 'Tourist not found' });
        }
      } else if (method === 'wallet') {
        tourist = await Tourist.findOne({ userID: touristId });
        if (!tourist) {
          console.error('Tourist not found');
          return res.status(404).json({ error: 'Tourist not found' });
        }
        if (tourist.wallet < itinerary.price) {
          console.error('Insufficient wallet balance');
          return res.status(400).json({ error: 'Insufficient wallet balance' });
        }
        tourist.wallet -= itinerary.price;
        await tourist.save();
      }
  
      // Mark the itinerary as paid by the user
      itinerary.paidBy.push(touristId);
      await itinerary.save();
  
      // Fetch user to get email
      const user = await User.findOne({ _id: tourist.userID });
      if (!user) {
        console.error('User not found');
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Log user email
      console.log('User email:', user.email);
  
      // Ensure user email is defined
      if (!user.email) {
        console.error('User email is not defined');
        throw new Error('User email is not defined');
      }
  
      // Send response first
      res.status(200).json({ message: 'Payment successful', remainingBalance: tourist.wallet });
  
      // Send receipt email asynchronously
      const emailSubject = 'Payment Receipt';
      const emailText = `Dear ${user.username},\n\nThank you for your payment of ${itinerary.price} EGP for the itinerary "${itinerary.name}".\n\nRemaining balance: ${tourist.wallet} EGP\n\nBest regards,\nLafefny Team`;
      sendReceiptEmail(user.email, emailSubject, emailText).catch(error => {
        console.error('Error sending receipt email:', error);
      });
    } catch (err) {
      console.error('Payment processing error:', err);
      res.status(500).json({ error: 'Payment failed', details: err.message });
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
    updateLoyaltyPoints(userId, itinerary.price); // Update loyalty points for the tourist
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
    decreaseLoyaltyPoints(userId, itinerary.price); // Decrease loyalty points for the tourist
    res.status(200).json({ message: "Booking canceled successfully", itinerary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;