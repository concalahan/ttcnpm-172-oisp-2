var express = require('express'),
	http = require("http"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	app = express();
    
var index = require('./routes/index');
 
mongoose.connect('mongodb://localhost/crawlTiki');

// App setup
app.set("view engine", "ejs");
  
app.use('/', index);

// app.get('/', function(req, res){
//     res.render("index");
// });

// Server setup
const port = process.env.PORT || 8080;
const server = http.createServer(app);
server.listen(port);

console.log("Server has started at port ", port);

