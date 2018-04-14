var mongoose = require("mongoose");
var passportLocalStrategy = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    mail: String,
    isAdmin: Boolean,
    mail_list: [{
        date: {type: Date, default: Date.now},
        content: String
    }],
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
    ]
});

userSchema.plugin(passportLocalStrategy);

module.exports = mongoose.model("User", userSchema);
