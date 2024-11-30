const express = require("express");
const Advertiser = require("../Models/advertiserModel");
const Activity = require("../Models/Activity");
const userSalesReportService = require('../Services/userSalesReportService');
const { uploadPdf } = require("./uploadController");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.post("/addAdvertiserInfo/:id", async (req, res) => {
  const { hotline, company, website } = req.body;
  const userID = req.params.id;

  if (!mongoose.isValidObjectId(userID)) {
    return res.status(400).json({ error: "Invalid advertiser ID" });
  }

  try {
    const advertiser = await Advertiser.create({
      hotline,
      company,
      website,
      userID,
    });

    if (!advertiser) {
      return res.status(404).json({ error: "Advertiser could not be created" });
    }

    return res.status(200).json(advertiser);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while adding advertiser information" });
  }
});

router.get("/getAdvertiser/:id", async (req, res) => {
  const userID = req.params.id; // Fix parameter extraction
  try {
    const advertiser = await Advertiser.find({ userID });
    if (!advertiser || advertiser.length === 0) {
      return res.status(404).json({ error: "Advertiser not found" });
    }
    res.status(200).json(advertiser);
  } catch (error) {
    res.status(400).json({ error: "not found" });
  }
});

router.patch("/updateAdvertiser/:id", async (req, res) => {
  const { hotline, company, website } = req.body;
  const userID = req.params.id;
  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).json({ error: "invalid advertiser" });
  }
  const advertiser = await Advertiser.findOneAndUpdate(
    { userID },
    { hotline, company, website }
  );
  if (!advertiser) {
    res.status(404).json({ error: "advertiser is not found" });
  }
  res.status(200).json(advertiser);
});

router.patch("/uploadLogo/:id", async (req, res) => {
  const { logo } = req.body;
  const userID = req.params.id;
  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).json({ error: "invalid advertiser" });
  }
  const advertiser = await Advertiser.findOneAndUpdate({ userID }, { logo });
  if (!advertiser) {
    res.status(404).json({ error: "advertiser is not found" });
  }
  res.status(200).json(advertiser);
});

router.patch("/uploadPDF/:id", uploadPdf, async (req, res) => {
  const filename = req.file.originalname;
  const contentType = req.file.mimetype;
  const data = req.file.buffer;
  const userID = req.params.id;

  if (!mongoose.isValidObjectId(userID)) {
    res.status(400).json({ error: "invalid advertiser" });
  }
  const advertiser = await Advertiser.findOneAndUpdate(
    { userID },
    { filename, contentType, data }
  );
  if (!advertiser) {
    res.status(404).json({ error: "advertiser is not found" });
  }
  res.status(200).json(advertiser);
});

router.get("/getPDF/:id", async (req, res) => {
  const userID = req.params.id;
  if (!mongoose.isValidObjectId(userID)) {
    return res.status(400).json({ error: "invalid advertiser" });
  }
  const advertiser = await Advertiser.findOne({ userID });
  if (!advertiser || !advertiser.data) {
    return res.status(404).json({ error: "PDF not found" });
  }

  res.setHeader("Content-Type", advertiser.contentType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${advertiser.filename}"`
  );
  res.send(advertiser.data);
});

router.get("/numberOfTourists/:id", async (req, res) => {
  const activityID = req.params.id;
  if (!mongoose.isValidObjectId(activityID)) {
    return res.status(400).json({ error: "invalid activity" });
  }
  const activity = await Activity.findOne({ _id: activityID });
  if (!activity) {
    return res.status(404).json({ error: "Activity not found" });
  }
  res.status(200).json(activity.touristBookings);
});

// Advertiser Sales Report Route
router.get('/advertiser/sales-report', async (req, res) => {
  try {
    const { startDate, endDate, activityId, month, year } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const filters = {
      activityId,
      month,
      year
    };

    const report = await userSalesReportService.getAdvertiserSalesReport(req.user._id, startDate, endDate, filters);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in advertiser sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating advertiser sales report',
      error: error.message
    });
  }
});
module.exports = router;
