const express= require("express");
const Seller= require("../Models/sellerModel");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/addSellerInfo/:id",async(req,res)=>{
    const { name, description} = req.body;
    const {userID}= req.params.id;
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid seller"})
    }

    const seller=  await Seller.create({name,description,userID})
   if(!seller){
    res.status(404).json({error:"advertiser is not found"});
   }
   res.status(200).json(seller);
}); 

router.get("/getSeller/:id",async(req,res)=>{
    const {userID}= req.params.id;
    try{
        const seller = await Seller.find({userID});
        res.status(200).json(seller)
    }catch(error){
        res.status(400).json({error:"not found"})
    }
});

router.put("/updateSellerInfo/:id",async(req,res)=>{
    const updatedInfo = req.body;
    const {userID}= req.params.id
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid advertiser"})
    }
    const seller=  await Seller.findOneAndUpdate({userID},updatedInfo)
   if(!advertiser){
    res.status(404).json({error:"advertiser is not found"});
   }
   res.status(200).json(seller);
});

module.exports= router;