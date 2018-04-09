var express = require('express'),
    router = express.Router(),
    request = require('request'),
    passport = require('passport'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    cheerio = require('cheerio');
    
var Product = require("../models/product");
var Category = require("../models/category");

//const START_URL = "https://tiki.vn/";

/*WHAT IS THIS FOR???*/
var requireAuth = passport.authenticate('jwt', {session: false});
var requireSignin = passport.authenticate('local', {session: false});
    
router.get("/", function(req, res){
    //res.render("index");
    res.send("Home page...");
});

router.get("/tiki", function(req, res){
    var options = {
        url : "https://tiki.vn/api/v2/deals/collections/?category_ids=&sort=rand&type=now&page=1&per_page=50&from=1519266000&to=1524450000&apikey=2cd335e2c2c74a6f9f4b540b91128e55"
    }
    
    request(options, function(err, res, body){
        if(err){
            console.log(err);
        } else {
            Object.preventExtensions(res);
            res.body.slice(0, res.body.length);
            var temp = JSON.parse(res.body);
            temp.data.forEach(function(productData){
                var productId = productData.product.id;
                var name = productData.product.name;
                var url_path = productData.product.url_path;
                var value = productData.product.price;
                //var categoryType = "unknown";
                request("https://tiki.vn/".concat(url_path), function(err, res, body) {
                    if(err){
                        console.log("Cannot request to product url: " + url_path);
                    } else {
                        if(res.statusCode === 200){
                            var $ = cheerio.load(body);
                            // get category
                            $('ul.breadcrumb').children().each(function(){
                                if($(this).children().text().trim() === "Trang chủ"){
                                    var categoryType = $(this).next().children().children().text().trim();
                                    
                                    // create product if not exist; else update price & date
                                    Product.findOneAndUpdate(
                                        { productId: productId },
                                        {
                                            $set: {
                                                productId: productId,
                                                name: name,
                                                url_path: url_path,
                                                categoryType: categoryType
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
                                            console.log("yay " + product);
                                        }
                                    });
                                }
                            });
                        } else {
                            console.log("Access to " + url_path + " with status code " + res.statusCode);
                        }
                    }
                });

            });

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


module.exports = router;
