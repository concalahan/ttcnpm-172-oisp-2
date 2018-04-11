var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index.js");
var nodemailer = require('nodemailer');

router.get("/admin/post", middleware.isLoggedIn, function(req, res){
    Post.find({}, function(err, foundPosts){
        if(err){
            res.redirect("/");
        } else {
            res.render("cms/posts", {posts: foundPosts});
        }
    });
});

router.get("/admin/page", middleware.isLoggedIn, function(req, res){
    Page.find({}, function(err, foundPage){
        if(err){
            res.redirect("/");
        } else {
            res.render("cms/pages", {pages: foundPage});
        }
    });
});

router.get("/admin/comment", middleware.isLoggedIn, function(req, res){
    Post.find({}).populate("comments").exec(function(err, posts){
        if(err){
            res.redirect("/");
        } else {
            res.render("cms/comments", {posts: posts});
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
        pass: process.env.MAIL_PASSWORD
      }
    });

    var mailOptions = {
      from: 'vuwebproject@gmail.com',
      to: req.body.email,
      subject: '[stream-hub.com] ' + req.body.subject,
      html: req.body.message
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    req.flash("success", "Cảm ơn đã liên hệ với chúng tôi, chúng tôi sẽ trả lời nhanh nhất có thể.");

    return res.redirect("/admin/mail");
});

router.get("/admin/setting", function(req, res){
    Schema.find({}, function(err, allPageSchema){
        if(err){
            console.log(err);
        } else {
            if (allPageSchema[0] != null) {
                const schema = allPageSchema[0].allPage;
                return res.render("cms/setting", {schema: schema});
            } else {
                return res.render("cms/setting", {schema: ""});
            }
        }
    });
});

router.post("/admin/schema", function(req, res){
    var schema = String(req.body.schema);

    //var two = req.body.schema.headerTwo;
    Schema.update({"identify": 1}, {$set:{"allPage": schema}}, {upsert: true, setDefaultsOnInsert: true}, function(err, foundSchema){
        if(err){
            console.log(err);
        } else {
            return res.redirect('/admin/setting');
        }
    });
});

module.exports = router;
