var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var nodemailer = require('nodemailer');

var Product = require("../models/product");

router.get("/admin", middleware.requireAdmin, function(req, res){
  return res.render("cms/landing");
});

router.get("/user", middleware.isLoggedIn, function(req, res){
  return res.send("day la user");
});

router.get("/admin/product", middleware.requireAdmin, function(req, res){
  Product.find({}, function(err, foundProducts){
    if(err){
      console.log(err);
    } else {
      return res.render("cms/product", {products: foundProducts});
    }
  });
});

router.get("/admin/mail", middleware.isLoggedIn, function(req, res){
  res.render("cms/mail");
});

router.post("/admin/mail", middleware.isLoggedIn, function(req, res){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vuwebproject@gmail.com',
        pass: 'Nvu123456'
      }
    });

    var mailOptions = {
      from: 'vuwebproject@gmail.com',
      to: req.body.email,
      subject: '[sosanhtiki.com] ' + req.body.subject,
      html: req.body.message
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return res.redirect("/admin/mail");
});

module.exports = router;
