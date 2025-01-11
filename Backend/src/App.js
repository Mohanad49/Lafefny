// External variables
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { checkBirthdays } = require('./services/birthdayPromoService');

// Import routes
const productRoute = require("./Routes/productController");
const activityRoute = require('./Routes/activityController');
const activityCategoryRoute = require('./Routes/activityCategoryController');
const PreferenceTagRoute = require('./Routes/preferenceTagController');
const userRoute = require("./Routes/userController");
const itinerariesRoute = require("./Routes/itineraryController");
const museumsRoute = require("./Routes/museumController");
const adminRoute = require("./Routes/adminController");
const touristItineraryRoute = require("./Routes/tourist-itineraryController");
const advertiserRoutes = require('./Routes/advertiserRoutes');
const sellerRoutes = require('./Routes/sellerRoutes');
const tourGuideRoutes = require('./Routes/tourGuideRoutes');
const touristRoutes = require('./Routes/touristRoutes');
const museumTagRoute = require('./Routes/museumTagController');
const complaintRoute = require('./Routes/complaintRoutes');
const amadeusRoute = require('./Routes/amadeusRoute');
const amadeusHotelRoutes = require('./Routes/amadeusHotel');
const promoRoutes = require('./Routes/promoRoutes');
const notificationRoute = require('./Routes/notificationRoutes');
const forgetpassRoute = require('./Routes/forgetpass');
require('./Services/reminderService');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

mongoose.set('strictQuery', false);
const MongoURI = process.env.MONGO_URI;

// App variables
const app = express();
const port = process.env.PORT || "8000";

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy!");
});

// Routes
app.get("/home", (req, res) => {
  res.status(200).send("You have everything installed!");
});

app.use('/products', productRoute);
app.use('/activities', activityRoute);
app.use('/activityCategory', activityCategoryRoute);
app.use('/preferenceTag', PreferenceTagRoute);
app.use('/', userRoute);
app.use("/itineraries", itinerariesRoute);
app.use("/museums", museumsRoute);
app.use('/admin', adminRoute);
app.use('/touristItinerary', touristItineraryRoute);
app.use('/advertiser', advertiserRoutes);
app.use('/seller', sellerRoutes);
app.use('/tourGuide', tourGuideRoutes);
app.use('/tourist', touristRoutes);
app.use('/museumTags', museumTagRoute);
app.use('/complaints', complaintRoute);
app.use('/amadeus', amadeusRoute);
app.use('/amadeusHotel', amadeusHotelRoutes);
app.use('/promos', promoRoutes);
app.use('/notifications', notificationRoute);
app.use('/forget', forgetpassRoute);

// Birthday promo scheduler
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running birthday promo check...');
    await checkBirthdays();
    console.log('Birthday promo check completed');
  } catch (error) {
    console.error('Error in birthday promo scheduler:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// MongoDB connection
mongoose.connect(MongoURI)
  .then(() => {
    console.log("MongoDB is now connected!")
    // Starting server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    })
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
