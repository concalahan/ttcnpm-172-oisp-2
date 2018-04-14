var User = require("./models/user");

function seedDB(){
  var newAdmin = new User({username: "admin"});
  User.register(newAdmin, "Haiconcacon123", function(err, user){
      if(err){
          console.log(err);
      } else {
          user.isAdmin = 1;
          user.save();
      }
  });

  var newUser = new User({username: "user"});
  User.register(newAdmin, "Haiconcacon123", function(err, user){
    if(err){
      console.log(err);
    } else {
      user.isAdmin = 0;
      user.save();
    }
  });
}

module.exports = seedDB;
