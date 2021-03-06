var express = require('express'),
    router = express.Router();

var Product = require("../models/product");
var Category = require("../models/category");

router.get("/delete", function(req, res){
  Product.remove({}, function(err, done){
    if(err){
      console.log("Err delete product " + err);
    } else {
      Category.remove({}, function(err, doneTwo){
        if(err){
          console.log("Err delete category " + err);
        } else {
          console.log("Delete all category and product!");
          res.redirect("/");
        }
      });
    }
  });
});

//search product POST route
router.post("/search", function(req, res) {
    // text pre-processing
    var searchText = (req.body.search).replace(/[^a-zA-Z0-9\s\(\)-]/g,'');
    Product.find({$text: {$search: searchText}}/*{$or: [{"name": searchText}, {"product_id": searchText}]}*/, function(err, foundProducts){
      if(err){
        console.log("Err at /search " + err);
        res.redirect("/");
      } else {
        Category.find({}).populate("products").exec(function(err, categories){
          if(err){
            console.log(err);
            return res.redirect("/");
          } else {
            return res.render("search-result", {foundProducts: foundProducts, categories: categories});
          }
        });
      }
    })
    //res.send("Search post route!!!");
});

router.get("/quen-mat-khau", function(req, res){
  res.render("forget-password");
});

// Each Category
router.get("/danh-muc/:category_url", function(req, res){
  Category.findOne({category_url: req.params.category_url}).populate("products").exec(function(err, foundCategory){
    if(err){
      console.log(err);
    } else {
      Category.find({}, function(err, categories){
        if(err){
          console.log(err);
          return res.redirect("/");
        } else {
          return res.render("category", {category: foundCategory, categories: categories});
        }
      });
    }
  });
});

// Each product
router.get("/:url_path", function(req, res){
  Product.findOne({url_path: req.params.url_path}, function(err, foundProduct){
    if(err){
      console.log(err);
    } else {
      Category.find({}).populate("products").exec(function(err, categories){
        if(err){
          console.log(err);
          return res.redirect("/");
        } else {
          return res.render("product", {product: foundProduct, categories: categories});
        }
      });
    }
  });
});

// Each product
router.post("/:url_path/comments", function(req, res){
  console.log("user " + req.body.comment.author);
  Product.findOne({url_path: req.params.url_path}, function(err, foundProduct){
    if(err){
      console.log(err);
      res.redirect("/");
    } else {
      var newComment = {
        author_name: req.body.comment.author,
        content: req.body.comment.content
      }

      foundProduct.comments.push(newComment);
      foundProduct.save();

      return res.redirect("/" + foundProduct.url_path);
    }
  });
});

module.exports = router;
