var mongoose = require("mongoose");

var CategorySchema = new mongoose.Schema({
    catId: String,
    name: String
});

module.exports = mongoose.model("Category", CategorySchema);
