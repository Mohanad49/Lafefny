const express= require("express");
const Seller= require("../Models/sellerModel");
const {uploadPdf} = require('./uploadController');
const { default: mongoose } = require("mongoose");
const userSalesReportService = require('../Services/userSalesReportService');

const router = express.Router();

router.post("/addSellerInfo/:id", async (req, res) => {
    const { name, description } = req.body;
    const userID = req.params.id;
    
    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({ error: "Invalid seller ID" });
    }
    
    try {
        const seller = await Seller.create({
            name: name || 'New Seller',
            description: description || 'New Seller Description',
            userID
        });
        
        return res.status(200).json(seller);
    } catch (error) {
        console.error('Error creating seller:', error);
        return res.status(500).json({ 
            error: "An error occurred while adding seller information",
            details: error.message 
        });
    }
});

router.get("/getSeller/:id", async(req,res) => {
    const userID = req.params.id;
    try {
        const seller = await Seller.find({userID});
        if (!seller || seller.length === 0) {
            return res.status(404).json({error: "Seller not found"});
        }
        res.status(200).json(seller);
    } catch(error) {
        res.status(400).json({error: "not found"});
    }
});

router.patch("/updateSellerInfo/:id",async(req,res)=>{
    const { name, description } = req.body;
    const userID= req.params.id
    if(!mongoose.isValidObjectId(userID)){
        res.status(400).json({error:"invalid seller"})
    }
    const seller= await Seller.findOneAndUpdate({userID},{ name, description })
   if(!seller){
    res.status(404).json({error:"seller is not found"});
   }
   res.status(200).json(seller);
});

router.patch("/uploadLogo/:id", async(req,res)=>{
  const {logo}=req.body;
  const userID = req.params.id
  if(!mongoose.isValidObjectId(userID)){
      res.status(400).json({error:"invalid seller"})
  }
  const seller= await Seller.findOneAndUpdate({userID},{logo});
  if(!seller){
      res.status(404).json({error:"seller is not found"});
  }
  res.status(200).json(seller);
})

router.patch("/uploadPDF/:id",uploadPdf,async(req,res)=>{
  const filename= req.file.originalname;
  const contentType= req.file.mimetype;
  const data= req.file.buffer;
  const userID = req.params.id

  if(!mongoose.isValidObjectId(userID)){
      res.status(400).json({error:"invalid seller"})
  }
  const seller= await Seller.findOneAndUpdate({userID},{filename,contentType,data});
  if(!seller){
      res.status(404).json({error:"seller is not found"});
  }
  res.status(200).json(seller);
})

router.get("/getPDF/:id", async(req,res)=>{
  const userID = req.params.id;
  if(!mongoose.isValidObjectId(userID)){
      return res.status(400).json({error:"invalid seller"})
  }
  const seller = await Seller.findOne({userID});
  if(!seller || !seller.data){
      return res.status(404).json({error:"PDF not found"});
  }
  
  res.setHeader('Content-Type', seller.contentType);
  res.setHeader('Content-Disposition', `inline; filename="${seller.filename}"`);
  res.send(seller.data);
});

// Seller Sales Report Route
router.get('/seller/sales-report', auth.verifySeller, async (req, res) => {
    try {
      const { startDate, endDate, productId, month, year } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
  
      const filters = {
        productId,
        month,
        year
      };
  
      const report = await userSalesReportService.getSellerSalesReport(req.user._id, startDate, endDate, filters);
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error in seller sales report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating seller sales report',
        error: error.message
      });
    }
  });
  



module.exports= router;