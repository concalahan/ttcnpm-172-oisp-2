var express = require('express'),
    http = require("http"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    app = express();

var index = require('./routes/index');

mongoose.connect('mongodb://localhost/crawlTiki');
//mongoose.connect('mongodb://admin:Haiconcacon123@ds233769.mlab.com:33769/ttcnpm');

// App setup
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', index);

// app.get('/', function(req, res){
//     res.render("index");
// });

// Server setup
const port = process.env.PORT || 8080;
const server = http.createServer(app);
server.listen(port);

console.log("Server has started at port ", port);

// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log("Server has started...");
// });
