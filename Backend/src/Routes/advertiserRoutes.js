const express= require("express");
const Advertiser= require("../Models/advertiserModel");
const {uploadPdf} = require('./uploadController');
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

router.patch("/updateAdvertiser/:id",async(req,res)=>{
    const { hotline, company, website }  = req.body;
    const userID= req.params.id
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid advertiser"})
    }
    const advertiser= await Advertiser.findOneAndUpdate({userID},{ hotline, company, website } )
   if(!advertiser){
    res.status(404).json({error:"advertiser is not found"});
   }
   res.status(200).json(advertiser);
});

router.patch("/uploadLogo/:id", async(req,res)=>{
    const {logo}=req.body;
    const userID = req.params.id
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid advertiser"})
    }
    const advertiser= await Advertiser.findOneAndUpdate({userID},{logo});
    if(!advertiser){
        res.status(404).json({error:"advertiser is not found"});
    }
    res.status(200).json(advertiser);
  })

  router.patch("/uploadPDF/:id",uploadPdf,async(req,res)=>{
    const filename= req.file.originalname;
    const contentType= req.file.mimetype;
    const data= req.file.buffer;
    const userID = req.params.id

    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid advertiser"})
    }
    const advertiser= await Advertiser.findOneAndUpdate({userID},{filename,contentType,data});
    if(!advertiser){
        res.status(404).json({error:"advertiser is not found"});
    }
    res.status(200).json(advertiser);
  })


module.exports= router;