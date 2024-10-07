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

module.exports=router