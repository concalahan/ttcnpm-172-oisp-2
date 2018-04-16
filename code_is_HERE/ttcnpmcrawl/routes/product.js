var express = require('express'),
    router = express.Router();

// Each product
router.get("/:url_path", function(req, res){
  Product.findOne({url_path: req.params.url_path}, function(err, foundProduct){
    if(err){
      console.log(err);
    } else {
      res.render("product", {product: foundProduct});
    }
  });
});

module.exports = router;
