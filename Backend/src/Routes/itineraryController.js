const express = require("express");
const mongoose = require("mongoose");

const Itinerary = require("../Models/Itinerary");
const Tourist = require("../Models/touristModel");
const { updateLoyaltyPoints, decreaseLoyaltyPoints } = require('./loyaltyPoints'); 

const Notification = require('../Models/notificationModel');

const { sendInappropriateContentEmail } = require('../Services/emailService');

const User = require('../Models/User');

const router = express.Router();



// POST route for creating a new itinerary

router.post("/", async (req, res) => {

  try {

    const newItinerary = new Itinerary(req.body); // Use Itinerary model to create new itinerary

    await newItinerary.save(); // Save the itinerary to the database

    res.status(201).json(newItinerary); // Respond with the created itinerary

  } catch (error) {

    res.status(400).json({ error: error.message }); // Send error if it fails

  }

});



// Read all itineraries

router.get('/', async (req, res) => {

  try {

    const itineraries = await Itinerary.find();

    res.json(itineraries);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});



// Get a specific itinerary by ID

router.get('/:id', async (req, res) => {

    try {

        const itinerary = await Itinerary.findById(req.params.id);

        if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });

        res.status(200).json(itinerary);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

});



// Update an itinerary

router.put('/:id', async (req, res) => {

  try {

    const updatedItinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(updatedItinerary);

  } catch (error) {

    res.status(400).json({ error: error.message });

  }

});



// Delete an itinerary

router.delete('/:id', async (req, res) => {

  try {

    const itinerary = await Itinerary.findById(req.params.id);

    if (itinerary.bookings.length > 0) {

      return res.status(400).json({ error: 'Cannot delete itinerary with existing bookings' });

    }

    await itinerary.remove();

    res.json({ message: 'Itinerary deleted' });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});



// Router to fetch upcoming itineraries

router.get('/upcomingItineraries', async (req, res) => {

    try {

        const itineraries = await Itinerary.find({

            date: { $gt: new Date() } // Only fetch future itineraries

        }).sort({ date: 1 }); // Sort by ascending date



        res.status(200).json(itineraries);



    } catch (error) {

        res.status(500).json({ message: "Error fetching upcoming itineraries", error });

    }

});



// Router to sort upcoming itineraries

router.get('/sortItineraries', async (req, res) => {

    try {

        const allowedSortFields = ['price', 'rating'];

        const { sortBy } = req.query;



        // Validate the sortBy field, use 'price' as the default if not provided or invalid

        if (!sortBy || !allowedSortFields.includes(sortBy)) {

            return res.status(400).json({ message: `Invalid sortBy value. Allowed values: ${allowedSortFields.join(', ')}` });

        }



        // Fetch upcoming itineraries sorted by the chosen field in ascending order

        const itineraries = await Itinerary.find({

            date: { $gt: new Date() } // Only fetch future itineraries

        }).sort({ [sortBy]: 1 }); // Sort in ascending order



        // Return sorted itineraries

        res.status(200).json(itineraries);



    } catch (error) {

        // Handle any errors during fetching

        res.status(500).json({ message: "Error sorting itineraries", error });

    }

});



router.get('/filterItineraries', async (req, res) => {

    try {

        const { price, date, preferences, language } = req.query;



        // Build the query object dynamically based on provided filters

        const query = {

            date: { $gt: new Date() } // Only fetch future itineraries by default

        };



        // Apply price filter if provided

        if (price) {

            query.price = { $lte: Number(price) }; // Assuming 'price' is stored as a number

        }



        // Apply date filter if provided

        if (date) {

            query.date = { $eq: new Date(date) }; // Matches the specific date

        }



        // Apply preferences filter if provided

        if (preferences) {

            const preferenceOptions = preferences.split(','); // Split multiple preferences by comma

            query.preferences = { $in: preferenceOptions }; // Check if itinerary includes any of the preferences

        }



        // Apply language filter if provided

        if (language) {

            query.language = language; // Matches the language exactly

        }



        // Fetch the filtered itineraries

        const itineraries = await Itinerary.find(query).sort({ date: 1 });



        // Return the filtered itineraries

        res.status(200).json(itineraries);



    } catch (error) {

        // Handle any errors during fetching

        res.status(500).json({ message: "Error fetching itineraries based on filters", error });

    }

});



// Router to search itineraries

router.get('/searchItineraries', async (req, res) => {

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



        // Search in the itineraries collection

        const itineraries = await Itinerary.find(query);

        res.status(200).json(itineraries);



    } catch (error) {

        res.status(500).json({ message: "Error performing itinerary search", error });

    }

});



router.get('/:id/availableDates', async (req, res) => {

  try {

    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {

      return res.status(404).json({ error: "Itinerary not found" });

    }



    const currentDate = new Date();

    const availableDates = itinerary.availableDates.filter(date => new Date(date) > currentDate);



    res.status(200).json({ availableDates });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});



// Booking route for an itinerary

router.post('/:id/book', async (req, res) => {

  try {

    const { userId, selectedDate } = req.body;

    

    if (!userId || !selectedDate) {

      return res.status(400).json({ error: "Missing required booking information" });

    }



    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {

      return res.status(404).json({ error: "Itinerary not found" });

    }



    // Convert dates to compare them properly

    const bookingDate = new Date(selectedDate);

    const isDateAvailable = itinerary.availableDates.some(date => 

      date.toISOString().split('T')[0] === bookingDate.toISOString().split('T')[0]

    );



    if (!isDateAvailable) {

      return res.status(400).json({ error: "Selected date is not available" });

    }



    // Check for existing booking

    const existingBooking = itinerary.touristBookings.find(booking => 

      booking.tourist.toString() === userId &&

      new Date(booking.bookedDate).toISOString().split('T')[0] === bookingDate.toISOString().split('T')[0]

    );
    // Add new booking

    itinerary.touristBookings.push({

      tourist: userId,

      bookedDate: bookingDate

    });



    await itinerary.save();

    updateLoyaltyPoints(userId, itinerary.price); // Update loyalty points for the tourist

    res.status(200).json({ message: "Booking successful", itinerary });

  } catch (error) {

    console.error('Booking error:', error);

    res.status(500).json({ error: error.message });

  }

});



// Cancel booking for an itinerary

router.post('/:id/cancel', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Find booking index where tourist matches userId
    const bookingIndex = itinerary.touristBookings.findIndex(
      booking => booking.tourist.toString() === userId.toString()
    );

    if (bookingIndex === -1) {
      return res.status(400).json({ error: "No booking found for this user" });
    }

    // Remove the booking
    itinerary.touristBookings.splice(bookingIndex, 1);

    // Remove the user from paidBy
    const paidByIndex = itinerary.paidBy.indexOf(userId);
    if (paidByIndex !== -1) {
      itinerary.paidBy.splice(paidByIndex, 1);
    }

    await itinerary.save();
    decreaseLoyaltyPoints(userId, itinerary.price); // Decrease loyalty points for the tourist
    
    // Refund the amount to the tourist's wallet
    const tourist = await Tourist.findOne({ userID: userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }
    tourist.wallet += itinerary.price;
    await tourist.save();

    res.status(200).json({
      message: "Booking canceled successfully",
      itinerary,
      refundedAmount: itinerary.price,
      newWalletBalance: tourist.wallet
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: error.message });
  }
});



router.patch('/:id/toggleActive', async (req, res) => {

  try {

    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });



    itinerary.isActive = !itinerary.isActive;

    await itinerary.save();



    res.json(itinerary);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});



// Toggle inappropriateFlag status of an itinerary

router.patch('/:id/toggleInappropriate', async (req, res) => {

  try {

    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });



    itinerary.inappropriateFlag = !itinerary.inappropriateFlag;

    await itinerary.save();



    if (itinerary.inappropriateFlag) {

      // Create notification for owner

      await Notification.create({

        recipient: itinerary.tourGuide,

        recipientModel: 'TourGuide', 

        message: `Your itinerary "${itinerary.name}" has been flagged as inappropriate`,

        type: 'INAPPROPRIATE_FLAG'

      });

      const user = await User.findById(itinerary.tourGuide);

      // Send email

      await sendInappropriateContentEmail(

        user.email,

        'itinerary',

        itinerary.name

      );

    }



    res.json(itinerary);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});



router.get('/tourGuide/:id', async (req, res) => {

  const tourGuideId = req.params.id;

  

  if (!mongoose.isValidObjectId(tourGuideId)) {

    return res.status(400).json({ error: "Invalid tourGuide ID" });

  }



  try {

    const itineraries = await Itinerary.find({ tourGuide: tourGuideId });

    

    if (!itineraries.length) {

      return res.status(404).json({ message: "No itineraries found for this tour guide" });

    }



    res.status(200).json(itineraries);

  } catch (error) {

    res.status(500).json({ 

      error: "Error fetching itineraries",

      details: error.message 

    });

  }

});



module.exports = router;

