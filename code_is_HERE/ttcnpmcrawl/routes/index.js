var express = require('express'),
    router = express.Router(),
    request = require('request'),
    passport = require('passport'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    KhongDau = require('khong-dau'),
    middleware = require("../middleware/index.js"),
    bodyParser = require("body-parser"),
    cheerio = require('cheerio');

router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var Product = require("../models/product");
var Category = require("../models/category");
var User = require("../models/user");

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

// HANDLE LOGIN LOGIC
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/"
    }), function(req, res){
});

router.get("/dang-ky", function(req, res){
  Category.find({}).populate("products").exec(function(err, categories){
    if(err){
      console.log(err);
    } else {
      res.render("register", {categories: categories, product: ''});
    }
  });
});

router.post("/dang-ky", function(req, res){
  var newUser = new User({mail: req.body.mail});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.send(err);
    } else {
      user.isAdmin = 0;
      user.save();
      res.redirect("/");
    }
  });
});

//logout route
router.get("/dang-xuat", function(req, res){
    req.logout();
    return res.redirect("/");
});

router.get("/ve-chung-toi", function(req, res){
    return res.render("/about-us");
});

// route for
router.get("/tiki-crawl", function(req, res){
  //var count = 0;
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

            // get price and product's brand
            var value = String($('#span-price').text().match( /\d+/g )).replace(/,/g, "");
            var brand = $('.item-brand').first().find('a').text();
            var date = new Date();
            var newPrice = {value: value, date: date};

            var m, moreImages = [], str = $('.product-content-detail').children().html(), rex = /<img[^>]+src="(https:\/\/[^">]+)"/g;

            // update more image to the product
            while ( m = rex.exec( str ) ) {
                moreImages.push( m[1] );
            }

            // Update brand of product
            Product.findOneAndUpdate(
            {
              product_id: product.product_id},  //query
              {
                $set: {"brand": brand}
              },
            function(err, product){
              if(err){
                console.log(err);
              }
            });

            // Get comment, then update all
            request("https://tiki.vn/api/v2/reviews?product_id=" + product.master_id + "&limit=50&apikey=2cd335e2c2c74a6f9f4b540b91128e55", function(err, res, body){
              if(err){
                console.log("Cannot get reviews of product: " + product.name + ". Err: " + err);
              } else {
                Object.preventExtensions(res);
                res.body.slice(0, res.body.length);
                var temp = JSON.parse(res.body);

                //console.log("lalala " + JSON.stringify(temp.data));

                temp.data.forEach(function(reviewData){
                  var cmt_id = reviewData.id;
                  var author_name = reviewData.created_by.name;

                  var content = reviewData.content;
                  var comment = {
                    cmt_id: cmt_id,
                    author_name: author_name,
                    content: content
                  };

                  // store comment and price to database
                  Product.findOneAndUpdate(
                    {product_id: product.product_id},  //query
                    {
                      $addToSet: {
                        "comments": comment,
                        "price": newPrice,
                        "more_thumbnail_url": {$each: moreImages}
                      }
                    },
                    {upsert: true, multi: true},
                    // {upsert: true, new: true, multi: true},
                  function(err, product){
                    if(err){
                      console.log("Err push comment, price and image: " + err);
                    } else {
                      console.log("Update comment, price, brand, image for product: " + product.name);
                    }
                  });
                });
              }
            });
          }
        });
      });
    }
  });
  res.send("crawling it again...");
});


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
        var constant, coefficient, isIncrease;
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
              constant = 0;
              coefficient = 1;
            } else {
              constant = (sumY*sumX2 - sumX*sumXY)/(y*sumX2-sumX*sumX);
              coefficient = (y*sumXY - sumX*sumY)/(y*sumX2-sumX*sumX);
            }
          }
          y = y + 1;
        });

        if(constant+product.updateTimes*coefficient > constant+(product.updateTimes-1)*coefficient){
          // current larger than last time
          isIncrease = 1;
        } else if(constant+product.updateTimes*coefficient > constant+(product.updateTimes-1)*coefficient){
          isIncrease = -1;
        } else {
          isIncrease = 0;
        }

        console.log("the function is: " + constant + "+ x*" + coefficient);
        console.log("------------------------------");

        Product.findByIdAndUpdate(
          product._id,
          {
            $set: {
              "linearReg.constant": constant,
              "linearReg.coefficient": coefficient,
              "isIncrease": isIncrease
            },
            $inc: { updateTimes: 1 }
          },
          function(err, updateProduct){
            if(err){
              console.log(err);
            } else {
              console.log("Update linear regression for " + updateProduct._id);
            }
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

        var result = 1, temp = 0;

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
            } else if (result < 1) {
              updateProduct.isIncrease = -1;
            } else {
              updateProduct.isIncrease = 0;
            }
            updateProduct.save();
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
        url : "https://tiki.vn/api/v2/deals/collections/?category_ids=&sort=rand&type=now&page=1&per_page=20&from=1521963271&to=1527147271&apikey=2cd335e2c2c74a6f9f4b540b91128e55"
        // https://tiki.vn/api/v2/deals/collections/?category_ids=&sort=rand&type=now&page=1&per_page=30&from=1519266000&to=1524450000&apikey=2cd335e2c2c74a6f9f4b540b91128e55
    };

    request(options, function(err, res, body){
        if(err){
            console.log(err);
        } else {
            Object.preventExtensions(res);
            res.body.slice(0, res.body.length);
            var temp = JSON.parse(res.body);
            //console.log(temp);
            temp.data.forEach(function(productData){
                var product_id = productData.product.id;
                var name = productData.product.name;
                var url_path = productData.product.url_path;
                url_path = url_path.split("?")[0];
                var thumbnail_url = productData.product.thumbnail_url;
                var value = productData.product.price;
                var rating = productData.product.rating_average;
                var master_id = productData.product.master_id;

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
                                    var category_url = KhongDau(category_type.toLowerCase(), ["chuyen", "url"]);

                                    // create product if not exist; else update price & date
                                    Category.findOneAndUpdate(
                                      {name: category_type},
                                      {
                                        $set: {
                                          name: category_type,
                                          category_url: category_url
                                        }
                                      }, { upsert: true, new: true }, function(err, category) {
                                        if(err){
                                          console.log("Error at /tiki when update category: " + err);
                                        } else {
                                          Product.findOneAndUpdate(
                                              { product_id: product_id },
                                              {
                                                  $set: {
                                                      product_id: product_id,
                                                      master_id: master_id,
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
    res.send("Crawl Tiki.vn");
});

module.exports = router;
