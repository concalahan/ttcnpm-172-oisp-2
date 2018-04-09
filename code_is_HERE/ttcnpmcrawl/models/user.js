var mongoose = require("mongoose");
var passportLocalStrategy = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    userId: String,
    name: String,
    pass: String,
    mail: String,
    mail_list: [{
        date: {type: Date, default: Date.now},
        content: String
    }]
});

userSchema.plugin(passportLocalStrategy);

module.exports = mongoose.model("User", userSchema);
