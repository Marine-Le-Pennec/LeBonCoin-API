const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require ("mongoose");

const app = express();
app.use(formidableMiddleware())

// Dotenv
require("dotenv").config()

// Cors
const cors = require("cors");
app.use(cors());

// Connection à la BDD
mongoose.connect(process.env.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
 );
 app.get("/", function (req, res) {
  res.send("Bienvenue sur l'API Leboncoin");
});

//  Import des models
// require ("./Models/User.js")
// require ("./Models/Offer.js")

// Import des routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
app.use(userRoutes)
app.use(offerRoutes)

app.all("*", function (req, res) {
  res.status(404).json({ error: "Not Found" });
});

// Pour démarrer le serveur :
app.listen(process.env.PORT,()=>{
    console.log("Server started!")
});