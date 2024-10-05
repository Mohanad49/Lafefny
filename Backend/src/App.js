// External variables
const express = require("express");
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
require("dotenv").config();
const MongoURI = process.env.MONGO_URI ;
const {adminSellerAddProduct,editProduct,getProduct}= require('./Routes/Controller')

//App variables
const app = express();
const port = process.env.PORT || "8000";
const admin = require('./Models/Product');

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
app.post("/postProduct", adminSellerAddProduct);
app.put('/editProduct/:id', editProduct);
app.get('/Products', getProduct);

