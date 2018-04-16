var express = require('express'),
    router = express.Router(),
    request = require('request'),
    passport = require('passport'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    middleware = require("../middleware/index.js");
    cheerio = require('cheerio');

var Product = require("../models/product");
var Category = require("../models/category");

router.get("/", function(req, res){
  Category.find({}).populate("products").exec(function(err, categories){
    if(err) {
      console.log(err);
      res.redirect("/");
    } else {
      res.render('index', {categories: categories});
    }
  });
});

// LOGIN PAGE
router.get("/login", function(req, res){
    return res.render("login");
});

// HANDLE LOGIN LOGIC
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    return res.redirect("/");
});

router.get("/test-tiki-crawl", function(req, res){
  request("https://tiki.vn/may-giat-cua-ngang-electrolux-ewf12843-8-0-kg-p460088.html", function(err, response, body){
    if(err) {
      console.log("err " + err);
    } else {
      var $ = cheerio.load(body);

      console.log($('#span-price').text());

      var value = String($('#span-price').text().match( /\d+/g )).replace(/,/g, "");

      console.log("value " + value);

      res.send("test crawl again");
    }
  });
});

router.get("/tiki-crawl", function(req, res){
  var count = 0;
  Product.find({}, function(err, foundProducts){
    if(err) {
      console.log(err);
    } else {
      foundProducts.forEach(function(product){
        request("https://tiki.vn/" + product.url_path, function(err, response, body){
          if(err) {
            console.log("err " + err);
          } else {
            var $ = cheerio.load(body);

            // get price
            var value = String($('#span-price').text().match( /\d+/g )).replace(/,/g, "");
            var date = new Date();
            var newPrice = {value: value, date: date};

            // pull out all the image in the content
            var m, moreImages = [], str = $('.product-content-detail').children().html(), rex = /<img[^>]+src="(https:\/\/[^">]+)"/g;

            // update more image to the product
            while ( m = rex.exec( str ) ) {
                moreImages.push( m[1] );
            }

            // get comment
            // request("https://tiki.vn/api/v2/reviews?product_id=" + product.product_id + "&apikey=2cd335e2c2c74a6f9f4b540b91128e55", function(err, res, body){
            //   if(err){
            //     console.log("Cannot get reviews of product: " + product.name + ". Err: " + err);
            //   } else {
            //     Object.preventExtensions(res);
            //     res.body.slice(0, res.body.length);
            //     var temp = JSON.parse(res.body);
            //     temp.data.forEach(function(reviewData){
            //       var cmt_id = reviewData.id;
            //       var author_name = reviewData.created_by.name;
            //       var content = reviewData.content;
            //       var comment = {
            //         cmt_id: cmt_id,
            //         author_name: author_name,
            //         content: content
            //       };
            //       // store comment and price to database
            //       Product.findOneAndUpdate(
            //         {product_id: product.product_id},  //query
            //         {
            //           $push: {"comments": comment}
            //         },
            //         {upsert: true, new: true},
            //       function(err, done){
            //         if(err){
            //           console.log("Err push comment " + err);
            //         } else {
            //           console.log("push 1 comment for product: " + product.name);
            //         }
            //       });
            //     });
            //   }
            // });
          }
        });
      });
    }
  });
  res.send("crawling it again...");
});

            // Product.findOneAndUpdate(
            //   {product_id: product.product_id},
            //   {
            //       $push: { "price": newPrice }
            //       //$push : { "more_thumbnail_url": moreImages }
            //   }, function(err, done) {
            //       if(err) {
            //         console.log(err);
            //       } else {
            //         console.log(count + " " + done.price);
            //         count = count + 1;
            //       }
            //   });

router.get("/linear-regression", function(req, res){
  var priceArray = [];

  Product.find({}, function(err, foundProducts){
    if(err) {
      res.redirect("/");
    } else {

      foundProducts.forEach(function(product){
        // loop through all date in product

        // linear regression formula:
        // http://www.statisticshowto.com/probability-and-statistics/regression-analysis/find-a-linear-regression-equation/
        var x=0,y=1,xy=0,x2=0,y2=0;
        var sumX=0, sumY=0, sumXY=0, sumX2=0, sumY2=0;
        var a, b;
        product.price.forEach(function(eachDay){
          x = eachDay.value/ 1000;
          xy = x*y;
          x2 = x*x;
          y2 = y*y;

          sumX = sumX + x;
          sumY = sumY + y;
          sumXY = sumXY + xy;
          sumX2 = sumX2 + x2;
          sumY2 = sumY2 + y2;

          if(y == product.price.length){
            if((y*sumX2-sumX*sumX) == 0) {
              a = 0;
              b = 1;
            } else {
              a = (sumY*sumX2 - sumX*sumXY)/(y*sumX2-sumX*sumX);
              b = (y*sumXY - sumX*sumY)/(y*sumX2-sumX*sumX);
            }

            console.log("the function is: " + a + "+ x*" + b);
            console.log("------------------------------");
          }
          y = y + 1;
        });
      });
    }
  });
  res.send("Apply linear regression!");
});

// Product price is inreased or decreased?
// Get the last month price to now, apply the formula to find if it increase or decrease over a month
router.get("/tiki-increase-or-decrease", function(req, res){
  // load all the price go into one Array
  var arrayPrice = []

  Product.find({}, function(err, foundProducts){
    if(err) {
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

        var result = 1, temp = 0, countTemp = 0;

        Product.findByIdAndUpdate(product._id,{"date": {$gte: new Date(startDate) , $lt: new Date(endDate)}}, function(err, updateProduct){
          if(err) {
            console.log(err);
          } else {
            // percentage increase 10% -> 1.1
            // percentage decrease 10% -> 0.9
            // apply the formula: increaseOrDecrease = basePrice * 1 * nextDayPrice * percentage * ...
            // Ex: 100 90 120 150 80 200
            // result = 100/100 * 90/100 * 120/100 * 150/100 * 80/100 * 200/100

            // Another way? https://toanmath.com/2017/11/cach-tim-cong-thuc-tong-quat-cua-day-so-cho-boi-cong-thuc-truy-hoi-pham-thi-thu-huyen.html
            temp = updateProduct.price/ startPrice;

            updateProduct.price.forEach(function(data){
              temp = data.value/ startPrice;
              result = result * temp;
            });

            console.log("product " + product.name + " " + result);

            if(result > 1) {
              updateProduct.isIncrease = 1;
              updateProduct.save();
            } else if (result < 1) {
              updateProduct.isDecrease = 1;
              updateProduct.save();
            }
          }
        });
      });
    }
  });

  res.send("Sort the increased one from the decreased one!");
});

router.get("/tang-gia", function(req, res){
  Product.find({isIncrease: true}, function(err, foundProduct) {
    if(err) {
      console.log(err);
    } else {
      console.log("hi " + foundProduct);
      res.render("category", {products: foundProduct});
    }
  });
});

router.get("/giam-gia", function(req, res){
  Product.find({isDecrease: true}, function(err, foundProduct) {
    if(err) {
      console.log(err);
    } else {
      console.log("hi " + foundProduct);
      res.render("category", {products: foundProduct});
    }
  });
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
                var rating = (productData.product.rating_value != 0) ? productData.product.rating_value : "No rating";
                //var categoryType = "unknown";
                request("https://tiki.vn/".concat(url_path), function(err, response, body) {
                    if(err){
                        console.log("Cannot request to product url: " + url_path);
                    } else {
                        if(response.statusCode === 200){
                            // request("https://tiki.vn/api/v2/reviews?product_id=".concat(product_id).concat("&apikey=2cd335e2c2c74a6f9f4b540b91128e55"), function(err, res, body){
                            //   if(err){
                            //     console.log(err);
                            //   } else {
                            //     Object.preventExtensions(res);
                            //     res.body.slice(0, res.body.length);
                            //     var body = JSON.parse(res.body);
                            //
                            //   }
                            // });
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
                                        if(err){
                                          console.log(err);
                                        } else {
                                          Product.findOneAndUpdate(
                                              { product_id: product_id },
                                              {
                                                  $set: {
                                                      product_id: product_id,
                                                      name: name,
                                                      url_path: url_path,
                                                      thumbnail_url: thumbnail_url,
                                                      rating: rating,
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
