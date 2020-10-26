                        // Imports des packages et des Models

// Express et Formidable
const express = require("express");
const formidableMiddleware = require("express-formidable");
const router = express.Router();
router.use(formidableMiddleware());

// Middleware
const isAuthenticated = require("../Middleware/isAuthenticated")

// Cloudinary
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  });

// Import Model
const Offer = require("../Models/Offer.js");

// -----------------------------------------------------------------------------------------------------

                    // ----------------------- CRUD ---------------------------

// Create
router.post("/publish",isAuthenticated, async(req,res)=>{
    try {
    const result = await cloudinary.uploader.upload(req.files.picture.path);

    const newOffer = new Offer({
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        picture: result,
        creator: req.user,
    })
    await newOffer.save();
    res.json({
        _id: newOffer._id,
        title: newOffer.title,
        description: newOffer.description,
        price: newOffer.price,
        picture: newOffer.picture,
        created: newOffer.created,
        creator: {
          account: newOffer.creator
        },
      });
        
      } catch (error) {
        res.json({ message: error.message });
      }
})

// Read
router.get("/offer/with-count", async(req,res)=>{
    try{

        // filters
        //Object vide à retourner
        let filters = {};

        // Titre
        if(req.query.title){
            filters.title = new RegExp(req.query.title,"i")
        }

        // PriceMin
        if(req.query.priceMin){
            filters.priceMin = {$gte:req.fields.priceMin}
        }

        // priceMax
        if (req.query.priceMax) {
            filters.price = {$lte: req.query.priceMax};
        }

        // priceMin et priceMax
        if (req.query.priceMin && req.query.priceMax) {
              filters.price = {
                $gte: req.query.priceMin,
                $lte: req.query.priceMax,
              };
            }

        // Sort
        //Object vide à retourner
        let sort ={}

        if (req.query.sort === "date-desc") {
        sort = { date: "desc" };
        } else if (req.query.sort === "date-asc") {
        sort = { date: "asc" };
        } else if (req.query.sort === "price-asc") {
        sort = { price: "asc" };
        } else if (req.query.sort === "price-desc") {
        sort = { price: "desc" };
        }

        // Compter le nombre de résultat
        const count = await Offer.countDocuments(filters);
        let offers;

        let page = Number(req.query.page);
        let limit = 10;

        if (!page) {
        // Forcer à afficher la première page
        page = 1;
        }

        offers = await Offer.find(filters)
        .select("title price created creator picture description")
        .populate({
            path: "creator",
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(sort);

        // Répondre au client
        return res.json({
        count: count,
        offers: offers,
        });

    } catch(error)
        {res.json({message:error.message})}
    })

// Read by ID
router.get("/offer/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const offer = await Offer.findOne({ _id: id }).populate({
        path: "creator",
      });
      res.json(offer);
    } catch (error) {
      res.json({ message: error.message });
    }
  });


module.exports = router;