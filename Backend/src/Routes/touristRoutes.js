const express= require("express");
const Tourist= require("../Models/touristModel");
const User= require("../Models/User");

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

module.exports=router