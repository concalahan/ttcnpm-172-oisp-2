var express = require('express'),
    router = express.Router();

var Product = require("../models/product");
var Category = require("../models/category");

// Each product
router.get("/:url_path", function(req, res){
  Product.findOne({url_path: req.params.url_path}, function(err, foundProduct){
    if(err){
      console.log(err);
    } else {
      Category.find({}, function(err, foundCategories){
        if(err){
          console.log(err);
        } else {
          res.render("product1", {product: foundProduct, categories: foundCategories});
        }
      });
    }
  });
});

module.exports = router;
