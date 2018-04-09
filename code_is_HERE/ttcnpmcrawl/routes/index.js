var express = require('express'),
    router = express.Router(),
    request = require('request'),
    passport = require('passport'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    cheerio = require('cheerio');

var Product = require("../models/product");
var Category = require("../models/category");


router.get("/", function(req, res){
    //res.render("index");
    res.send("Home page...");
});

router.get("/tiki-crawl", function(req, res){
  Product.find({}, function(err, foundProducts){
    if(err) {
      console.log(err);
      res.redirect("/");
    } else {
      foundProducts.forEach(function(product){
        request("https://tiki.vn/" + product.url_path, function(err, response, body){
          if(err) {
            console.log("err " + err);
          } else {
            var $ = cheerio.load(body);

            // get price, tyim all except value, and ,
            var value = String($('#span-price').text().match( /\d+/g )).replace(/,/g, "");
            var newPrice = {value: value};

            // pull out all the image in the content
            var m, moreImages = [], str = $('.product-content-detail').children().html(), rex = /<img[^>]+src="(https:\/\/[^">]+)"/g;

            // update more image to the product
            while ( m = rex.exec( str ) ) {
                moreImages.push( m[1] );
            }

            Product.findOneAndUpdate(
              {product_id: product.product_id},
              {
                  $push: { "price": newPrice },
                  $push : { "more_thumbnail_url": moreImages }
              }, function(err, done) {
                  if(err) {
                    console.log(err);
                  } else {
                    console.log(done);
                  }
              });
          }
        });

      });
    }
  });
  res.send("crawling it again...");
});

// Product price is inreased or decreased?
// Get the last month price to now, apply the formula to find if it increase or decrease over a month
router.get("/tiki-increase", function(req, res){
  // load all the price go into one Array
  var arrayPrice = []

  Product.find({}, function(err, foundProducts){
    if(err) {
      console.log(err);
      res.redirect("/");
    } else {
      var endDate = new Date();
      endDate.setDate(endDate.getDate()-30);
      foundProducts.forEach(function(product){
        var count = 0, haveValueInDB = 0;
        var startPrice, startDate;

        // get the basePrice
        product.price.forEach(function(each){
          // compare date with the last month, guarantee it run 31 time
          if(
            endDate.getUTCDate() == each.date.getUTCDate() &&
            endDate.getUTCMonth() == each.date.getUTCMonth() &&
            count == 31
          ) {
            // have it in the database
            haveValueInDB = 1;
            startPrice = each.value;
            startDate = each.date;
          }

          if(haveValueInDB == 0) {
            // get the first date
            startPrice = product.price[0].value;
            startDate = product.price[0].date;
          }

          count = count+1;
        });

        Product.findByIdAndUpdate(product._id,{"date": {$gte: new Date(startDate) , $lt: new Date(endDate)}}, function(err, updateProduct){
          if(err) {
            console.log(err);
          } else {
            // percentage increase 10% -> 1.1
            // percentage decrease 10% -> 0.9
            // apply the formula: increaseOrDecrease = basePrice * 1 * nextDayPrice * percentage * ...

            // % of change = ( )(new - old)/ old ) * 100
            var result, temp, countTemp = 0;

            if(countTemp == 0) {
              temp = ((updateProduct.price - startPrice)/startPrice)*100;
              countTemp = countTemp + 1;
            } else {
              ((updateProduct.price - temp)/temp)*100
            }


            console.log("success hihi" + updateProduct.name);
          }
        });

        //console.log("base date: " + baseDate);
        //console.log("product " + product.name + "base date: " + baseDate);
      });
    }
  });



  res.send("Find the increased one!");

});

router.get("/tiki", function(req, res){
    var options = {
        url : "https://tiki.vn/api/v2/deals/collections/?category_ids=&sort=rand&type=now&page=1&per_page=30&from=1519266000&to=1524450000&apikey=2cd335e2c2c74a6f9f4b540b91128e55"
    }

    request(options, function(err, res, body){
        if(err){
            console.log(err);
        } else {
            Object.preventExtensions(res);
            res.body.slice(0, res.body.length);
            var temp = JSON.parse(res.body);
            temp.data.forEach(function(productData){
                var product_id = productData.product.id;
                var name = productData.product.name;
                var url_path = productData.product.url_path;
                url_path = url_path.split("?")[0];
                var thumbnail_url = productData.product.thumbnail_url;
                var value = productData.product.price;
                //var categoryType = "unknown";
                request("https://tiki.vn/".concat(url_path), function(err, response, body) {
                    if(err){
                        console.log("Cannot request to product url: " + url_path);
                    } else {
                        if(response.statusCode === 200){
                            var $ = cheerio.load(body);
                            // get category
                            $('ul.breadcrumb').children().each(function(){
                                if($(this).children().text().trim() === "Trang chủ"){
                                    var category_type = $(this).next().children().children().text().trim();

                                    // create product if not exist; else update price & date
                                    Category.findOneAndUpdate(
                                      {name: category_type},
                                      {
                                        $set: {
                                          name: category_type
                                        }
                                      }, { upsert: true, new: true }, function(err, category) {
                                        Product.findOneAndUpdate(
                                            { product_id: product_id },
                                            {
                                                $set: {
                                                    product_id: product_id,
                                                    name: name,
                                                    url_path: url_path,
                                                    thumbnail_url: thumbnail_url,
                                                    category_type: category_type
                                                }
                                            },
                                            { upsert: true, new: true }
                                        , function(err, product) {
                                            if(err) {
                                                console.log(err);
                                            } else {
                                                // push the current price
                                                product.price.push({value: value});
                                                product.save();

                                                category.products.push(product);
                                                category.save();
                                                console.log("yay " + category);
                                            }
                                        });
                                      }
                                    )
                                }
                            });
                        } else {
                            console.log("Access to " + url_path + " with status code " + response.statusCode);
                        }
                    }
                });
            });
        }
    });
    res.send("temp");
});

router.get("/index", function(req, res){
  Category.find({}).populate("products").exec(function(err, categories){
    if(err) {
      console.log(err);
      res.redirect("/");
    } else {
      res.render('index', {categories: categories});
    }
  });
});

router.get("/delete", function(req, res){
    Product.remove({}, function(err, done){
        if(err){
            console.log(err);
        } else {
            console.log("Delete all products!");
            res.redirect("/");
        }
    });
});

router.get("/:url_path", function(req, res){
  Product.findOne({url_path: req.params.url_path}, function(err, foundProduct){
        if(err){
            res.redirect("/");
        } else {
            res.render("product", {product: foundProduct});
        }
    });
});


module.exports = router;
