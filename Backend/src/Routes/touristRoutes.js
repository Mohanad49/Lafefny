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

module.exports=router