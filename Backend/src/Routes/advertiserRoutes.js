const express= require("express");
const Advertiser= require("../Models/advertiserModel");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/addAdvertiserInfo/:id", async (req, res) => {
    const { hotline, company, website } = req.body;
    const userID = req.params.id;

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({ error: "Invalid advertiser ID" });
    }

    try {
        const advertiser = await Advertiser.create({ hotline, company, website, userID });

        if (!advertiser) {
            return res.status(404).json({ error: "Advertiser could not be created" });
        }

        return res.status(200).json(advertiser);
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while adding advertiser information" });
    }
});


router.get("/getAdvertiser/:id",async(req,res)=>{
    const {userID}= req.params.id;
    try{
        const advertiser = await Advertiser.find({userID});
        res.status(200).json(advertiser)
    }catch(error){
        res.status(400).json({error:"not found"})
    }
});



module.exports= router;