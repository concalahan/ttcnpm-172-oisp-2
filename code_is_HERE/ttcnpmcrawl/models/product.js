var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
    product_id: String,
    master_id: String,
    name: String,
    brand: String,
    url_path: String,
    thumbnail_url: String,
    more_thumbnail_url: [ String ],
    price: [{
        _id: false,
        value: Number,
        date: {type: Date, default: Date.now}
    }],
    provider: String,
    category_type: String,
    comments: [
        {
            _id: false,
            cmt_id: String,
            author_name: String,
            content: String
        }
    ],
    rating: Number,
    isIncrease: Number
});

ProductSchema.index({name: "text", product_id: "text"});

module.exports = mongoose.model("Product", ProductSchema);
