var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
    productId: String,
    name: String,
    url_path: String,
    price: [{
        value: Number,
        date: {type: Date, default: Date.now}
    }],
    provider: String,
    categoryType: String,
    image_url: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Product", ProductSchema);
