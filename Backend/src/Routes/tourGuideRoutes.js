const express= require("express");
const TourGuide= require("../Models/tourGuideModel");
const {uploadPdf} = require('./uploadController');
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/addTourGuideInfo/:id",async(req,res)=>{
    const { mobile, yearsOfExperience, previousWork} = req.body;
    const userID = req.params.id;
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid tour guide"})
    }
    const tourGuide = await TourGuide.create({ mobile,yearsOfExperience, previousWork, userID})
   if(!tourGuide){
    res.status(404).json({error:"tour guide is not found"});
   }
   res.status(200).json(tourGuide);
}); 

router.get("/getTourGuide/:id",async(req,res)=>{
    const userID = req.params.id;
    try{
        const tourGuide = await TourGuide.find({userID});
        res.status(200).json(tourGuide)
    }catch(error){
        res.status(400).json({error:"not found"})
    }
});

router.patch("/updateTourGuideInfo/:id",async(req,res)=>{
    const { mobile, yearsOfExperience, previousWork} = req.body;
    const userID = req.params.id
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid tour guide"})
    }
    const tourGuide=  await TourGuide.findOneAndUpdate({userID},{ mobile, yearsOfExperience, previousWork})
   if(!tourGuide){
    res.status(404).json({error:"tour guide is not found"});
   }
   res.status(200).json(tourGuide);
});

router.patch("/uploadPicture/:id", async(req,res)=>{
    const {picture}=req.body;
    const userID = req.params.id
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid tour guide"})
    }
    const tourGuide= await TourGuide.findOneAndUpdate({userID},{picture});
    if(!tourGuide){
        res.status(404).json({error:"tour guide is not found"});
    }
    res.status(200).json(tourGuide);
})

router.patch("/uploadPDF/:id",uploadPdf,async(req,res)=>{
    const filename= req.file.originalname;
    const contentType= req.file.mimetype;
    const data= req.file.buffer;
    const userID = req.params.id

    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid tour guide"})
    }
    const tourGuide= await TourGuide.findOneAndUpdate({userID},{filename,contentType,data});
    if(!tourGuide){
        res.status(404).json({error:"tour guide is not found"});
    }
    res.status(200).json(tourGuide);
  })



module.exports= router;