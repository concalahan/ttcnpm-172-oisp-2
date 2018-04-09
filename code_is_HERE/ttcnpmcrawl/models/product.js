var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
    product_id: String,
    name: String,
    url_path: String,
    thumbnail_url: String,
    more_thumbnail_url: [ String ],
    price: [{
        value: Number,
        date: {type: Date, default: Date.now}
    }],
    provider: String,
    category_type: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    isIncrease: Boolean,
    isDecrease: Boolean
});

module.exports = mongoose.model("Product", ProductSchema);
