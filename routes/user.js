                        // Imports des packages et des Models

// Express
const express = require("express");
const router = express.Router();


// Crypto
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// Models
const User = require("../Models/User")

// --------------------------------------------------------------------------

// Creation d'un nouvel utilisateur
router.post("/signup", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.fields.email });
  
      if (user) {
        res.json({ message: "Cet utilisateur possède déjà un compte" });
      } else {
        if (req.fields.email && req.fields.password && req.fields.username) {
          const token = uid2(64);
          const salt = uid2(64);
          const hash = SHA256(req.fields.password + salt).toString(encBase64);
          const newUser = new User({
            email: req.fields.email,
            username:req.fields.username,
            token: token,
            salt: salt,
            hash: hash,
          });
  
          await newUser.save();
  
          res.json({
            _id: newUser._id,
            token: newUser.token,
            username:newUser.username,
            email:newUser.email
          });
        } else {
          res.json({ error: "Paramètre(s) manquants" });
        }
      }
    } catch (error) {
      res.json({ message: error.message });
    }
  });


//   Login
router.post("/login",async (req,res)=>{
try{
    const user = await User.findOne({ email: req.fields.email });
    if(user){
        if (
            SHA256(req.fields.password + user.salt).toString(encBase64) === user.hash) {
            res.json({
              _id: user._id,
              token: user.token,
              username: user.username,
              email:user.email
            });
          } else {
            res.status(401).json({ error: "Unauthorized" });
          }
    } else {
        res.json({message:"Utilisateur inconnu"})
    }
} catch(error){
    res.json({message:error.message})
}
})

module.exports = router;