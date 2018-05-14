var User = require("../models/user");

// all middleware goes here!
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

middlewareObj.requireAdmin = function(req, res, next) {
  if(!req.user) {
    res.send("You must login!");
  }

  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  } else {
    res.send(401, 'Unauthorized');
  }
}

module.exports = middlewareObj;
