const express= require("express");
const Tourist= require("../Models/touristModel");
const User= require("../Models/User");
const TouristItinerary = require("../Models/Tourist-Itinerary");
const Itinerary = require("../Models/Itinerary"); // Adjust the path to your Itinerary model
const Activity = require("../Models/Activity");
const { processCardPayment } = require('../Services/payingService');
const TourGuide = require("../Models/tourGuideModel");
const Advertiser = require("../Models/advertiserModel");
const Product = require('../Models/Product'); // Import Product model
const { createPaymentIntent } = require('../Services/payingService'); // Import createPaymentIntent
const { sendReceiptEmail } = require('../Services/emailService');
const Order = require('../Models/Order');

const { default: mongoose } = require("mongoose");

const router = express.Router();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add a test route
router.get('/test', (req, res) => {
  res.json({ message: 'Tourist routes are working' });
});

router.get("/getTouristInfo/:id", async(req,res) => {
    const _id = req.params.id;
    try {
        const user = await User.findOne({_id});
        const touristInfo = await Tourist.findOne({userID: _id});
        
        if (!user || !touristInfo) {
            return res.status(404).json({error: "Tourist not found"});
        }

        const result = {
            ...user.toObject(),
            wallet: touristInfo.wallet,
            loyaltyPoints: touristInfo.loyaltyPoints,
            level: touristInfo.level,
            badge: touristInfo.badge
        };

        res.status(200).json([result]); // Keep array format for compatibility
    } catch(error) {
        console.error("Error fetching tourist info:", error);
        res.status(400).json({error: "Tourist not found"});
    }
});

router.patch("/updateTouristInfo/:id", async (req, res) => {
  const { username, dateOfBirth, mobileNumber, nationality, job, wallet } = req.body;
  const _id = req.params.id;
  if (!mongoose.isValidObjectId(_id)) {
    return res.status(400).json({ error: "Invalid tourist ID" });
  }
  try {
    const tourist = await User.findOneAndUpdate(
      { _id },
      { username, dateOfBirth, mobileNumber, nationality, job },
      { new: true }
    );
    const touristU = await Tourist.findOneAndUpdate(
      { userID: _id },
      { wallet },
      { new: true }
    );
    if (!tourist || !touristU) {
      return res.status(404).json({ error: "Tourist not found" });
    }
    const result = {
      ...tourist.toObject(),
      wallet: touristU.wallet
    };
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating tourist info:", error);
    res.status(500).json({ error: "Failed to update tourist info" });
  }
});

// New endpoint to update preferences
router.put("/updatePreferences/:id", async (req, res) => {
    const { preferences } = req.body;
    const userID = req.params.id;

    try {
        const tourist = await Tourist.findOneAndUpdate(
            { userID },
            { $set: { preferences } },
            { new: true, useFindAndModify: false }
        );

        if (!tourist) {
            return res.status(404).json({ error: "Tourist not found" });
        }

        res.status(200).json(tourist);
    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ error: "Failed to update preferences" });
    }
});

// New endpoint to get tourist preferences
router.get("/getTouristPreferences/:id", async (req, res) => {
    const userID = req.params.id;

    try {
        const tourist = await Tourist.findOne({ userID });

        if (!tourist) {
            return res.status(404).json({ error: "Tourist not found" });
        }

        res.status(200).json({ preferences: tourist.preferences });
    } catch (error) {
        console.error("Error fetching tourist preferences:", error);
        res.status(500).json({ error: "Failed to fetch preferences" });
    }
});

// New endpoint to add a new tourist
router.post("/addTourist", async (req, res) => {
    const { userID, wallet, preferences, loyaltyPoints, level, badge } = req.body;

    // Validate required fields
    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Create a new tourist instance
        const newTourist = new Tourist({
            userID,
            wallet: wallet || 0, // Default to 0 if not provided
            preferences: preferences || [], // Default to empty array if not provided
            loyaltyPoints: loyaltyPoints || 0, // Default to 0 if not provided
            level: level || 1, // Default to 1 if not provided
            badge: badge || 'Bronze' // Default to 'Bronze' if not provided
        });

        // Save the new tourist to the database
        const savedTourist = await newTourist.save();
        res.status(201).json(savedTourist); // Respond with the created tourist
    } catch (error) {
        console.error("Error adding tourist:", error);
        res.status(500).json({ error: "Failed to add tourist" });
    }
});

router.get("/touristHistory/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const currentDate = new Date();
    

    // Find the tourist's user information
    const user = await User.findById(userID);
    if (!user) {
      console.error('Tourist not found');
      return res.status(404).json({ error: "Tourist not found" });
    }
    

    // Get all activities first
    const activities = await Activity.find();
    

    // Filter activities manually
    const pastActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const isPaid = activity.paidBy && activity.paidBy.some(id => id.toString() === userID);
      const isPast = activityDate < currentDate;
      
      

      return isPaid && isPast;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

   

    // Get all itineraries
    const itineraries = await Itinerary.find();
    
    // Get all tour guides and users for efficient lookup
    const tourGuides = await TourGuide.find();
    const users = await User.find({ role: 'TourGuide' });

    // Create lookup maps for efficient access
    const tourGuideMap = new Map(tourGuides.map(guide => [guide.userID, guide]));
    const userMap = new Map(users.map(user => [user._id.toString(), user]));
   
    // Filter itineraries manually
    const pastItineraries = itineraries.filter(itinerary => {
      // Find the booking for this specific user
      const userBooking = itinerary.touristBookings?.find(
        booking => booking.tourist.toString() === userID
      );
      
      const isPaid = itinerary.paidBy && itinerary.paidBy.some(id => id.toString() === userID);
      const isPast = userBooking && new Date(userBooking.bookedDate) < currentDate;
      
      return isPaid && isPast;
    }).sort((a, b) => {
      // Sort by the user's specific booking date
      const aBooking = a.touristBookings?.find(booking => booking.tourist.toString() === userID);
      const bBooking = b.touristBookings?.find(booking => booking.tourist.toString() === userID);
      
      return new Date(bBooking?.bookedDate || 0) - new Date(aBooking?.bookedDate || 0);
    });

    // Format itineraries data
    const formattedItineraries = pastItineraries.map(itinerary => {
      const tourGuide = tourGuideMap.get(itinerary.tourGuide.toString());
      const user = tourGuide ? userMap.get(tourGuide.userID) : null;

      return {
        _id: itinerary._id,
        name: itinerary.name,
        locations: itinerary.locations,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        price: itinerary.price,
        tourGuideName: user?.username || 'Unknown Guide',
        tourGuideId: tourGuide?._id?.toString(),
        activities: itinerary.activities,
        ratings: itinerary.ratings,
        image: itinerary.image,
        language: itinerary.language,
        duration: itinerary.duration,
        description: itinerary.description,
        paidBy: itinerary.paidBy
      };
    });

    res.json({
      pastActivities,
      pastItineraries: formattedItineraries,
      touristName: user.username
    });

  } catch (error) {
    console.error("Error fetching tourist history:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/upcomingActivities/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
  
    // Step 1: Find the tourist to get the `touristName`
    const tourist = await User.findOne({ _id: mongoose.Types.ObjectId(userID) });
    if (!tourist) {
      return res.status(404).json({ message: 'Tourist not found' });
    }
  
    // Step 2: Fetch all activities
    const allActivities = await Activity.find();
  
    // Step 3: Filter activities that contain the userID in `touristBookings` and have a future date
    const upcomingActivities = allActivities.filter(activity => 
      activity.paidBy.includes(userID) && new Date(activity.date) > new Date()
    );
  
    // Step 4: Send the filtered activities in the response
    res.json({
      upcomingActivities,
      touristName: tourist.username
    });
  } catch (error) {
    console.error("Error fetching upcoming activities:", error);
    res.status(500).json({ message: error.message });
  }
});
  
// Add activity review
router.post("/activities/:activityId/reviews", async (req, res) => {
  try {
    const { activityId } = req.params;
    const review = req.body;
      
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Add the new review
    activity.ratings.reviews.push(review);
      
    // Update average rating
    const totalRating = activity.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
    activity.ratings.averageRating = totalRating / activity.ratings.reviews.length;
    activity.ratings.totalRatings = activity.ratings.reviews.length;

    await activity.save();
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add itinerary review
router.post("/itineraries/:itineraryId/reviews", async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const review = req.body;
      
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Add the new review
    itinerary.ratings.reviews.push(review);
      
    // Update average rating
    const totalRating = itinerary.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
    itinerary.ratings.averageRating = totalRating / itinerary.ratings.reviews.length;
    itinerary.ratings.totalRatings = itinerary.ratings.reviews.length;

    await itinerary.save();
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update the tour guide review endpoint
router.post("/tour-guides/:tourGuideId/reviews", async (req, res) => {
  try {
    const { tourGuideId } = req.params;
    const review = req.body;
      
    // Find the tour guide document using the tour guide's ID
    const tourGuide = await TourGuide.findById(tourGuideId);
    if (!tourGuide) {
      return res.status(404).json({ message: 'Tour Guide profile not found' });
    }

    // Initialize ratings if they don't exist
    if (!tourGuide.ratings) {
      tourGuide.ratings = {
        averageRating: 0,
        totalRatings: 0,
        reviews: []
      };
    }

    // Add the new review
    tourGuide.ratings.reviews.push(review);
      
    // Update average rating
    const totalRating = tourGuide.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
    tourGuide.ratings.averageRating = totalRating / tourGuide.ratings.reviews.length;
    tourGuide.ratings.totalRatings = tourGuide.ratings.reviews.length;

    await tourGuide.save();
    res.status(200).json(tourGuide);
  } catch (error) {
    console.error("Error adding tour guide review:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add this to TouristRoutes.js
router.post("/redeemPoints/:id", async (req, res) => {
    const userId = req.params.id;
    const POINTS_TO_EGP_RATIO = 100; // 10000 points = 100 EGP, so 100 points = 1 EGP

    try {
        const tourist = await Tourist.findOne({ userID: userId });
        
        if (!tourist) {
            return res.status(404).json({ error: "Tourist not found" });
        }

        if (tourist.loyaltyPoints < 10000) {
            return res.status(400).json({ 
                error: "Insufficient points. Minimum 10000 points required for redemption." 
            });
        }

        // Calculate EGP to add (10000 points = 100 EGP)
        const pointsToRedeem = Math.floor(tourist.loyaltyPoints / 10000) * 10000;
        const egpToAdd = pointsToRedeem / POINTS_TO_EGP_RATIO;

        // Update wallet and points
        tourist.wallet += egpToAdd;
        tourist.loyaltyPoints -= pointsToRedeem;

        await tourist.save();

        res.status(200).json({
            message: "Points redeemed successfully",
            pointsRedeemed: pointsToRedeem,
            egpAdded: egpToAdd,
            newWalletBalance: tourist.wallet,
            remainingPoints: tourist.loyaltyPoints
        });
    } catch (error) {
        console.error("Error redeeming points:", error);
        res.status(500).json({ error: "Failed to redeem points" });
    }
});

// Update the transportation booking route
router.post("/:userId/transportation-booking", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookingData = req.body;

    // Find the tourist
    const tourist = await Tourist.findOne({ userID: userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Find the advertiser by company name
    const advertiser = await Advertiser.findOne({ company: bookingData.providerName });
    if (!advertiser) {
      return res.status(404).json({ error: "Advertiser not found" });
    }

    // Add booking to tourist
    tourist.transportationBookings.push({
      ...bookingData,
      bookingStatus: 'Pending'
    });

    // Add tourist to advertiser's bookings
    advertiser.touristBookings.push(userId);

    // Save both documents
    await Promise.all([
      tourist.save(),
      advertiser.save()
    ]);

    res.status(201).json({ message: "Transportation booked successfully" });
  } catch (error) {
    console.error("Error booking transportation:", error);
    res.status(500).json({ error: "Failed to book transportation" });
  }
});

// Get accepted advertisers
router.get("/advertisers", async (req, res) => {
  try {
    const advertisers = await Advertiser.find();
    res.status(200).json(advertisers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch advertisers' });
  }
});

// Get wishlist items
router.get('/:userId/wishlist', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Populate the wishlist with product details
    const populatedTourist = await Tourist.findOne({ userID: req.params.userId })
      .populate('wishlist');

    res.json(populatedTourist.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete('/:userId/wishlist/:productId', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    tourist.wishlist = tourist.wishlist.filter(
      id => id.toString() !== req.params.productId
    );

    await tourist.save();
    res.json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get cart items
router.get('/:userId/cart', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // Populate the cart with product details
    const populatedTourist = await Tourist.findOne({ userID: req.params.userId })
      .populate('cart.productId');

    // Format the response to include both product details and quantity
    const cartItems = populatedTourist.cart.map(item => ({
      ...item.productId.toObject(),
      quantity: item.quantity
    }));

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/:userId/cart/:productId', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const cartItem = tourist.cart.find(
      item => item.productId.toString() === req.params.productId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cartItem.quantity = req.body.quantity;
    await tourist.save();
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove from cart
router.delete('/:userId/cart/:productId', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId });
    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    tourist.cart = tourist.cart.filter(
      item => item.productId.toString() !== req.params.productId
    );

    await tourist.save();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/bookings', async (req, res) => {
  const { id } = req.params;
  try {
    const tourist = await Tourist.findById(id).populate('bookings');
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    res.status(200).json(tourist.bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/:activityId/pay', async (req, res) => {
  const { activityId } = req.params;
  const { method, paymentMethodId, touristId } = req.body;
  try {
    console.log('Received payment request');
    console.log('activityId:', activityId);
    console.log('method:', method);
    console.log('paymentMethodId:', paymentMethodId);
    console.log('touristId:', touristId);

    const activity = await Activity.findById(activityId);
    if (!activity) {
      console.error('Activity not found');
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if the user has already paid for this activity
    if (activity.paidBy.includes(touristId)) {
      return res.status(400).json({ error: 'You have already paid for this activity' });
    }

    let tourist;
    if (method === 'card') {
      const paymentResult = await processCardPayment(paymentMethodId, activity.price);
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
      if (tourist.wallet < activity.price) {
        console.error('Insufficient wallet balance');
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      tourist.wallet -= activity.price;
      await tourist.save();
    }

    // Mark the activity as paid by the user
    activity.paidBy.push(touristId);
    await activity.save();

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
    const emailText = `Dear ${user.username},\n\nThank you for your payment of ${activity.price} EGP for the activity "${activity.name}".\n\nRemaining balance: ${tourist.wallet} EGP\n\nBest regards,\nLafefny Team`;
    sendReceiptEmail(user.email, emailSubject, emailText).catch(error => {
      console.error('Error sending receipt email:', error);
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: 'Payment failed', details: err.message });
  }
});

router.post('/:itineraryId/payment', async (req, res) => {
  const { itineraryId } = req.params;
  const { method, paymentMethodId, touristId } = req.body;
  try {
    console.log('Received payment request');
    console.log('itineraryId:', itineraryId);
    console.log('method:', method);
    console.log('paymentMethodId:', paymentMethodId);
    console.log('touristId:', touristId);

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      console.error('Itinerary not found');
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Check if the user has already paid for this itinerary
    if (itinerary.paidBy.includes(touristId)) {
      return res.status(400).json({ error: 'You have already paid for this itinerary' });
    }
    
    let tourist;
    if (method === 'card') {
      const paymentResult = await processCardPayment(paymentMethodId, itinerary.price);
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

// Get all addresses
router.get("/:userId/addresses", async (req, res) => {
    try {
        const tourist = await Tourist.findOne({ userID: req.params.userId });
        if (!tourist) {
            return res.status(404).json({ error: "Tourist not found" });
        }
        res.status(200).json(tourist.addresses || []);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ error: "Failed to fetch addresses" });
    }
});

// Add new address
router.post("/:userId/addresses", async (req, res) => {
    try {
        console.log('Adding address for user:', req.params.userId);
        console.log('Address data:', req.body);

        // Use findOneAndUpdate instead of findOne and save
        const updatedTourist = await Tourist.findOneAndUpdate(
            { userID: req.params.userId },
            { $push: { addresses: req.body } },
            { new: true, runValidators: true }
        );
        
        if (!updatedTourist) {
            console.log('Tourist not found for ID:', req.params.userId);
            return res.status(404).json({ error: "Tourist not found" });
        }

        console.log('Address added successfully:', updatedTourist.addresses);
        res.status(201).json(updatedTourist.addresses);
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({ error: error.message || "Failed to add address" });
    }
});

// Update address
router.put("/:userId/addresses/:index", async (req, res) => {
    try {
        console.log('Updating address for user:', req.params.userId, 'at index:', req.params.index);
        console.log('New address data:', req.body);

        const updatedTourist = await Tourist.findOneAndUpdate(
            { userID: req.params.userId },
            { $set: { [`addresses.${req.params.index}`]: req.body } },
            { new: true, runValidators: true }
        );

        if (!updatedTourist) {
            console.log('Tourist not found for ID:', req.params.userId);
            return res.status(404).json({ error: "Tourist not found" });
        }

        console.log('Address updated successfully:', updatedTourist.addresses);
        res.status(200).json(updatedTourist.addresses);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ error: "Failed to update address" });
    }
});

// Delete address
router.delete("/:userId/addresses/:index", async (req, res) => {
    try {
        console.log('Deleting address for user:', req.params.userId, 'at index:', req.params.index);

        const updatedTourist = await Tourist.findOneAndUpdate(
            { userID: req.params.userId },
            { $unset: { [`addresses.${req.params.index}`]: 1 } },
            { new: true }
        );

        if (!updatedTourist) {
            console.log('Tourist not found for ID:', req.params.userId);
            return res.status(404).json({ error: "Tourist not found" });
        }

        // Remove null values from addresses array
        await Tourist.findOneAndUpdate(
            { userID: req.params.userId },
            { $pull: { addresses: null } }
        );

        console.log('Address deleted successfully');
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ error: "Failed to delete address" });
    }
});

// Add this route for Stripe payment intent
router.post('/:userId/create-payment-intent', async (req, res) => {
  try {
    console.log('Creating payment intent:', req.body);
    const { amount, currency = 'usd' } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: req.params.userId
      }
    });

    console.log('Payment intent created:', paymentIntent.client_secret);
    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/:userId/orders', async (req, res) => {
  try {
    console.log('Creating order for user:', req.params.userId);

    // Find the tourist by userID
    const tourist = await Tourist.findOne({ userID: req.params.userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Check wallet balance if payment method is Wallet
    if (req.body.paymentMethod === 'Wallet') {
      if (tourist.wallet < req.body.totalAmount) {
        return res.status(400).json({ 
          error: "Insufficient wallet balance",
          currentBalance: tourist.wallet,
          requiredAmount: req.body.totalAmount
        });
      }
      tourist.wallet -= req.body.totalAmount;
    }

    // Generate unique orderId
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderId = `ORD-${timestamp}-${random}`;
    if (!orderId) {
      console.error("Generated orderId is null or undefined");
    }

    // Log the orderId to confirm it is being generated correctly
    console.log('Generated orderId:', orderId);

    // Ensure orderId is set
    if (!orderId) {
      return res.status(500).json({ error: "Failed to generate a unique orderId" });
    }

    // Create order data
    const orderData = {
      orderId: orderId,
      user: tourist._id,
      products: req.body.products.map(product => ({
        productId: product.productId,
        quantity: product.quantity,
        price: product.price
      })),
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      selectedAddress: req.body.selectedAddress,
      orderStatus: 'Processing'
    };

    // Log the order data to confirm all fields are set
    console.log('Creating order with data:', orderData);

    // Create a new order document with the orderData
    const newOrder = new Order(orderData);
    
    // Save the order
    const savedOrder = await newOrder.save();

    // Add order to tourist's orders array and clear cart
    tourist.orders = tourist.orders || [];
    tourist.orders.push(savedOrder._id);
    tourist.cart = []; // Empty the cart after placing the order
    await tourist.save();

    // Send the response with order details and updated wallet balance
    res.status(201).json({
      order: savedOrder,
      newWalletBalance: tourist.wallet
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: error.message,
      details: error.stack
    });
  }
});

// Add flight booking
router.post('/addFlightBooking', async (req, res) => {
  try {
    const { userId, flightDetails } = req.body;

    // Find the tourist
    const tourist = await Tourist.findOne({ userID: userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Create flight booking object
    const flightBooking = {
      airline: flightDetails.validatingAirlineCodes[0],
      flightNumber: flightDetails.itineraries[0].segments[0].number,
      departureDate: flightDetails.itineraries[0].segments[0].departure.at,
      arrivalDate: flightDetails.itineraries[0].segments[0].arrival.at,
      departureAirport: flightDetails.itineraries[0].segments[0].departure.iataCode,
      arrivalAirport: flightDetails.itineraries[0].segments[0].arrival.iataCode,
      bookingStatus: 'Confirmed', // Fixed to match schema enum
      price: flightDetails.price.total
    };

    // Add to tourist's flight bookings
    tourist.flightBookings.push(flightBooking);
    await tourist.save();

    res.status(201).json({ 
      message: "Flight booked successfully",
      flightBooking 
    });
  } catch (error) {
    console.error('Error booking flight:', error);
    res.status(500).json({ error: error.message || "Failed to book flight" });
  }
});

// Add hotel booking
router.post("/addHotelBooking", async (req, res) => {
  try {
    const { userId, hotelDetails } = req.body;

    // Validate required fields
    if (!userId || !hotelDetails) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the tourist
    const tourist = await Tourist.findOne({ userID: userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Add the hotel booking
    tourist.hotelBookings.push(hotelDetails);
    await tourist.save();

    res.status(200).json({ 
      message: "Hotel booking added successfully",
      booking: tourist.hotelBookings[tourist.hotelBookings.length - 1]
    });

  } catch (error) {
    console.error("Error adding hotel booking:", error);
    res.status(500).json({ error: "Failed to add hotel booking" });
  }
});

// Update wallet balance route to use existing wallet field
router.get('/:userId/wallet-balance', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }
    res.json({ balance: tourist.wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tourist orders
router.get('/:userId/orders', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId })
      .populate({
        path: 'orders',
        populate: {
          path: 'products.productId',
          model: 'Product'
        }
      });

    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    res.status(200).json(tourist.orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this new route for cancelling orders
router.put('/:userId/orders/:orderId/cancel', async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    
    // Find the tourist
    const tourist = await Tourist.findOne({ userID: userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Find and update the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Only allow cancellation if order is in Processing state
    if (order.orderStatus !== 'Processing') {
      return res.status(400).json({ 
        error: "Order cannot be cancelled in its current state" 
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order details
router.get('/:userId/orders/:orderId', async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    
    const tourist = await Tourist.findOne({ userID: userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    const order = await Order.findById(orderId)
      .populate('products.productId');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:touristId/add-wallet', async (req, res) => {
  const { touristId } = req.params;

  try {
    const tourist = await Tourist.findOne({ userID: touristId });
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }

    tourist.wallet += 10000000;
    await tourist.save();

    res.status(200).json({ message: 'Wallet updated successfully', wallet: tourist.wallet });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

// Bookmark activity
router.post('/:userId/bookmark-activity/:activityId', async (req, res) => {
  try {
    const { userId, activityId } = req.params;

    const tourist = await Tourist.findOne({ userID: userId });
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Check if activity exists
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Check if already bookmarked
    const isBookmarked = tourist.bookmarkedActivities.includes(activityId);
    
    if (isBookmarked) {
      // Remove bookmark
      tourist.bookmarkedActivities = tourist.bookmarkedActivities.filter(
        id => id.toString() !== activityId
      );
      await tourist.save();
      res.json({ message: "Activity removed from bookmarks", isBookmarked: false });
    } else {
      // Add bookmark
      tourist.bookmarkedActivities.push(activityId);
      await tourist.save();
      res.json({ message: "Activity bookmarked successfully", isBookmarked: true });
    }
  } catch (error) {
    console.error('Error bookmarking activity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookmarked activities
router.get('/:userId/bookmarked-activities', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId })
      .populate('bookmarkedActivities');
    
    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    res.json(tourist.bookmarkedActivities);
  } catch (error) {
    console.error('Error fetching bookmarked activities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookmarked tours
router.get('/:userId/bookmarked-tours', async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ userID: req.params.userId })
      .populate('bookmarkedTours');

    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    res.json(tourist.bookmarkedTours);
  } catch (error) {
    console.error('Error fetching bookmarked tours:', error);
    res.status(500).json({ error: "Failed to fetch bookmarked tours" });
  }
});

// Bookmark tour
router.post('/:userId/bookmark-tour/:tourId', async (req, res) => {
  try {
    const { userId, tourId } = req.params;
    const tourist = await Tourist.findOne({ userID: userId });

    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found" });
    }

    // Check if already bookmarked
    const isBookmarked = tourist.bookmarkedTours.includes(tourId);

    if (isBookmarked) {
      // Remove bookmark
      tourist.bookmarkedTours = tourist.bookmarkedTours.filter(
        id => id.toString() !== tourId
      );
      await tourist.save();
      res.json({ message: "Tour removed from bookmarks", isBookmarked: false });
    } else {
      // Add bookmark
      tourist.bookmarkedTours.push(tourId);
      await tourist.save();
      res.json({ message: "Tour bookmarked successfully", isBookmarked: true });
    }
  } catch (error) {
    console.error('Error bookmarking tour:', error);
    res.status(500).json({ error: "Failed to bookmark tour" });
  }
});

module.exports=router