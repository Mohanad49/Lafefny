// External variables
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');

const productRoute = require("./Routes/productController");
const activityRoute = require('./Routes/activityController');
const userRoute = require("./Routes/userController");
const itinerariesRoute = require("./Routes/itineraryController");
const museumsRoute = require("./Routes/museumController");
const adminRoute = require("./Routes/adminController");
const touristItineraryRoute  = require("./Routes/tourist-itineraryController");

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


app.use(express.json())
app.use('/products' , productRoute);
app.use('/activities', activityRoute);
app.use('/', userRoute);
app.use("/itineraries", itinerariesRoute);
app.use("/museums", museumsRoute);
app.use('/admin', adminRoute);
app.use('/touristItinerary', touristItineraryRoute);