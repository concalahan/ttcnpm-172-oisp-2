var express = require('express'),
    router = express.Router();

var Product = require("../models/product");
var Category = require("../models/category");

// Each Category
router.get("/danh-muc/:category_url", function(req, res){
  Category.findOne({category_url: req.params.category_url}).populate("products").exec(function(err, foundCategory){
    if(err){
      console.log(err);
    } else {
      Category.find({}, function(err, categories){
        if(err){
          console.log(err);
        } else {
          console.log("test " + foundCategory);
          res.render("category", {category: foundCategory, categories: categories});
        }
      });
    }
  });
});

// Each product
router.get("/:url_path", function(req, res){
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA");
  Product.findOne({url_path: req.params.url_path}, function(err, foundProduct){
    if(err){
      console.log(err);
    } else {
      Category.find({}).populate("products").exec(function(err, categories){
        if(err){
          console.log(err);
        } else {
          res.render("product", {product: foundProduct, categories: categories});
        }
      });
    }
  });
});

module.exports = router;
