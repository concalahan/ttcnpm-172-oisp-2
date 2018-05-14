var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var nodemailer = require('nodemailer');

var User = require("../models/user");
var Product = require("../models/product");

router.get("/user", function(req, res){
  return res.send("Hello user");
});

router.post("/track/:user_id/:product_id", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
      if(err){
        console.log(err);
      } else {
        Product.findOne({product_id: req.params.product_id}, function(error, foundProduct){
          if(error){
            console.log(error);
          } else {
            foundUser.products.push(foundProduct);
            foundUser.save();

            var mailOptions = {
              from: 'vuwebproject@gmail.com',
              to: '145giakhang@gmail.com',
              subject: '[sosanhtiki.com] Cảm ơn bạn đã theo dõi sản phẩm ' + foundProduct.name,
              html: "Chúng tôi sẽ thông báo cho bạn khi sản phẩm có sự thay đổi về giá."
            };

            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          }
        })
      }
    });

    // req.flash("success", "Cảm ơn đã liên hệ với chúng tôi, chúng tôi sẽ trả lời nhanh nhất có thể.");

    return res.redirect("back");
});

module.exports = router;
