// External variables
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');

const productRoute = require("./Routes/productController");
const activityRoute = require('./Routes/activityController');
const activityCategoryRoute = require('./Routes/activityCategoryController');
const PreferenceTagRoute = require('./Routes/preferenceTagController');
const userRoute = require("./Routes/userController");
const itinerariesRoute = require("./Routes/itineraryController");
const museumsRoute = require("./Routes/museumController");
const adminRoute = require("./Routes/adminController");
const touristItineraryRoute  = require("./Routes/tourist-itineraryController");
const activityCategoryRoute = require('./Routes/activityCategoryController');
const PreferenceTagRoute = require('./Routes/preferenceTagController');
const advertiserRoutes = require('./Routes/advertiserRoutes');
const sellerRoutes = require('./Routes/sellerRoutes');
const tourGuideRoutes = require('./Routes/tourGuideRoutes');
const touristRoutes = require('./Routes/touristRoutes');
const museumTagRoute = require('./Routes/museumTagController');


mongoose.set('strictQuery', false);
require("dotenv").config();
const MongoURI = process.env.MONGO_URI ;

//App variables
const app = express();
const port = process.env.PORT || "8000";
app.use(cors());

// configurations
// Mongo DB
mongoose.connect(MongoURI)
.then(()=>{
  console.log("MongoDB is now connected!")
// Starting server
 app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
  })
})
.catch(err => console.log(err));

app.get("/home", (req, res) => {
    res.status(200).send("You have everything installed!");
  });

<<<<<<< HEAD


=======
  const corsOptions = {
    origin: 'http://localhost:5173', 
    optionsSuccessStatus: 200 
  };
  
  app.use(cors(corsOptions));
>>>>>>> e2c526a0f0008a5a30d508f1d9a993d62dd418b2

app.use(express.json())
app.use('/products' , productRoute);
app.use('/activities', activityRoute);
app.use('/activityCategory', activityCategoryRoute);
app.use('/preferenceTag', PreferenceTagRoute);
app.use('/', userRoute);
app.use("/itineraries", itinerariesRoute);
app.use("/museums", museumsRoute);
app.use('/admin', adminRoute);
app.use('/touristItinerary', touristItineraryRoute);
app.use('/activityCategory', activityCategoryRoute);
app.use('/preferenceTag', PreferenceTagRoute);
app.use('/advertiser', advertiserRoutes);
app.use('/seller', sellerRoutes);
app.use('/tourGuide', tourGuideRoutes);
app.use('/tourist', touristRoutes);
app.use('/museumTags', museumTagRoute);

