var express = require('express'),
    http = require("http"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    //session = require('express-session'),
    cookieSession = require('cookie-session'),
    morgan = require('morgan'),
    robots = require('express-robots'),
    app = express();

var User = require("./models/user");
var seedDB = require("./seed"),
keys = require('./config/keys');

require('./services/passport');

var index = require('./routes/index');
var productRoutes = require('./routes/product');
var userRoutes = require('./routes/user');
var cmsRoutes = require("./routes/cms");

mongoose.connect(keys.mongoURI);
//mongoose.connect('mongodb://admin:Haiconcacon123@ds233769.mlab.com:33769/ttcnpm');


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(robots({UserAgent: '*', Disallow: '/admin'})); // for robots.txt
app.use(morgan('dev'));
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey]
  })
);

// required for passport session
// app.use(session({
//     secret: 'This is secret',
//     saveUninitialized: false,
//     resave: false
// }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  // res.locals.error = req.flash("error");
  // res.locals.success = req.flash("success");
  next();
});

app.use('/', cmsRoutes);
app.use('/', userRoutes);
app.use('/', index);
app.use('/', productRoutes);

//seedDB();

// 404 route
app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// Server setup
const port = process.env.PORT || 8080;
const server = http.createServer(app);
server.listen(port);

console.log("Server has started at port ", port);
