const express= require("express");
const Seller= require("../Models/sellerModel");
const {uploadPdf} = require('./uploadController');
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/addSellerInfo/:id", async (req, res) => {
    const { name, description } = req.body;
    const userID = req.params.id;
    if (!mongoose.isValidObjectId(userID)) {
      return res.status(400).json({ error: "invalid seller" });
    }
    try {
      const seller = await Seller.create({ name, description, userID });
      res.status(200).json(seller);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "An error occurred while adding seller information" });
    }
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


router.get('/pdf/:id', async (req, res) => {
  try {
      const userID = req.params.id;

      // Attempt to find the document by userID
      const pdf = await Seller.findOne({ userID });

      
          return res.json(pdf);
      

      // Set headers and send the PDF data if found
      res.set({
          'Content-Type': pdf.pdfContentType,
          'Content-Disposition': `attachment; filename="${pdf.pdfFilename}"`,
      });

      res.send(pdf.pdfData);
  } catch (error) {
      console.error("Error retrieving PDF:", error);
      res.status(500).send('Error retrieving PDF');
  }
});



module.exports= router;