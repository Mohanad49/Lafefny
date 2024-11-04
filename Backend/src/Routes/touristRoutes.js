const express= require("express");
const Tourist= require("../Models/touristModel");
const User= require("../Models/User");
const TouristItinerary = require("../Models/Tourist-Itinerary"); // Adjust the path to your Itinerary model
const Activity = require("../Models/Activity");
const TourGuide = require("../Models/tourGuideModel");

const { default: mongoose } = require("mongoose");

const router = express.Router();

router.get("/getTouristInfo/:id",async(req,res)=>{
    const _id= req.params.id
    try{
        const tourist= await User.find({_id})
        const touristInfo = await Tourist.find({userID:_id});
        const result = {
            ...tourist,
            wallet: touristInfo.wallet
        }
        res.status(200).json(result);

    }catch(error){
        res.status(400).json({error:"tourist not found"});
    }
})

router.patch("/updateTouristInfo/:id",async (req,res)=>{
    const {username,dateOfBirth,mobileNumber,nationality,job,wallet} = req.body;
    const _id= req.params.id
    if(!mongoose.isValidObjectId(_id)){
        res.status(400).json({error:"invalid tour guide"})
    }
    const tourist= await User.findOneAndUpdate({_id},{username,dateOfBirth,mobileNumber,nationality,job});
    const touristU= await Tourist.create({userID:_id, wallet})
   if(!tourist|| !touristU){
    res.status(404).json({error:"tourist is not found"});
   }
   const result = {
    ...tourist,
    wallet: touristU.wallet
}
   res.status(200).json(result);
})

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
      
  
      // Step 1: Find the tourist to get the `touristName`
      const tourist = await User.findOne({ _id: mongoose.Types.ObjectId(userID)});
      if (!tourist) {
        
        return res.status(404).json({ message: 'Tourist not found' });
      }
      
  
      // Step 2: Fetch all activities
      const allActivities = await Activity.find();
      
      // Step 3: Filter activities that contain the userID in `touristBookings` and have a past date
      const pastActivities = allActivities.filter(activity => 
        activity.touristBookings.includes(userID) && new Date(activity.date) < new Date()
      );
      
  
      // Step 4: Fetch all itineraries
      const allItineraries = await TouristItinerary.find();
  
      // Step 5: Filter itineraries for the tourist's name with a past `endDate`
      const pastItineraries = allItineraries.filter(itinerary => 
        itinerary.touristName === tourist.username && new Date(itinerary.endDate) < new Date()
      );
      
  
      // Step 6: Send the filtered activities and itineraries in the response
      res.json({
        pastActivities,
        pastItineraries,
        touristName: tourist.username
      });
    } catch (error) {
      console.error("Error fetching tourist history:", error);
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
      
      const itinerary = await TouristItinerary.findById(itineraryId);
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
  router.post("/tour-guides/:tourGuideName/reviews", async (req, res) => {
    try {
      const { tourGuideName } = req.params;
      const review = req.body;
      
      // First find the user with the given username
      const user = await User.findOne({ username: tourGuideName });
      if (!user) {
        return res.status(404).json({ message: 'Tour Guide not found' });
      }

      // Then find the tour guide document using the user's ID
      const tourGuide = await TourGuide.findOne({ userID: user._id });
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



module.exports=router