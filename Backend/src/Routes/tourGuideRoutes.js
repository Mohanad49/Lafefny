const express = require("express");
const TourGuide = require("../Models/tourGuideModel");
const Itinerary = require("../Models/Itinerary");
const userSalesReportService = require('../Services/userSalesReportService');
const { uploadPdf } = require("./uploadController");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/addTourGuideInfo/:id", async (req, res) => {
  const { mobile, yearsOfExperience, previousWork } = req.body;
  const userID = req.params.id;
  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).json({ error: "invalid tour guide" });
  }
  const tourGuide = await TourGuide.create({
    mobile,
    yearsOfExperience,
    previousWork,
    userID,
  });
  if (!tourGuide) {
    res.status(404).json({ error: "tour guide is not found" });
  }
  res.status(200).json(tourGuide);
});

router.get("/getTourGuide/:id", async (req, res) => {
  const userID = req.params.id;
  try {
    const tourGuide = await TourGuide.find({ userID });
    res.status(200).json(tourGuide);
  } catch (error) {
    res.status(400).json({ error: "not found" });
  }
});

router.patch("/updateTourGuideInfo/:id", async (req, res) => {
  const { mobile, yearsOfExperience, previousWork } = req.body;
  const userID = req.params.id;
  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).json({ error: "invalid tour guide" });
  }
  const tourGuide = await TourGuide.findOneAndUpdate(
    { userID },
    { mobile, yearsOfExperience, previousWork }
  );
  if (!tourGuide) {
    res.status(404).json({ error: "tour guide is not found" });
  }
  res.status(200).json(tourGuide);
});

router.patch("/uploadPicture/:id", async (req, res) => {
  const { picture } = req.body;
  const userID = req.params.id;
  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).json({ error: "invalid tour guide" });
  }
  const tourGuide = await TourGuide.findOneAndUpdate({ userID }, { picture });
  if (!tourGuide) {
    res.status(404).json({ error: "tour guide is not found" });
  }
  res.status(200).json(tourGuide);
});

router.patch("/uploadPDF/:id", uploadPdf, async (req, res) => {
  const filename = req.file.originalname;
  const contentType = req.file.mimetype;
  const data = req.file.buffer;
  const userID = req.params.id;

  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).json({ error: "invalid tour guide" });
  }
  const tourGuide = await TourGuide.findOneAndUpdate(
    { userID },
    { filename, contentType, data }
  );
  if (!tourGuide) {
    res.status(404).json({ error: "tour guide is not found" });
  }
  res.status(200).json(tourGuide);
});

router.get("/getPDF/:id", async (req, res) => {
  const userID = req.params.id;
  if (!mongoose.isValidObjectId(userID)) {
    return res.status(400).json({ error: "invalid tour guide" });
  }
  const tourGuide = await TourGuide.findOne({ userID });
  if (!tourGuide || !tourGuide.data) {
    return res.status(404).json({ error: "PDF not found" });
  }

  res.setHeader("Content-Type", tourGuide.contentType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${tourGuide.filename}"`
  );
  res.send(tourGuide.data);
});

router.get("/numberOfTourists/:id", async (req, res) => {
  const itineraryID = req.params.id;
  if (!mongoose.isValidObjectId(itineraryID)) {
    res.status(400).json({ error: "invalid itinerary" });
  }
  try {
    const itinerary = await Itinerary.findOne({ _id: itineraryID });
    res.status(200).json(itinerary.touristBookings);
  } catch (error) {
    res.status(400).json({ error: "not found" });
  }
});

// Tour Guide Sales Report Route
router.get('/tourguide/sales-report', auth.verifyTourGuide, async (req, res) => {
  try {
    const { startDate, endDate, itineraryId, month, year } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const filters = {
      itineraryId,
      month,
      year
    };

    const report = await userSalesReportService.getTourGuideSalesReport(req.user._id, startDate, endDate, filters);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in tour guide sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating tour guide sales report',
      error: error.message
    });
  }
});



module.exports = router;
