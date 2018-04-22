var mongoose = require("mongoose");

var CategorySchema = new mongoose.Schema({
    name: String,
    category_url: String,
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ]
});

module.exports = mongoose.model("Category", CategorySchema);
