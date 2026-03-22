const joi = require("joi");
const Listing = require("./models/listing.js");
const review = require("./models/review.js");

module.exports.ListingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.string().allow("", null),
        category: joi.string().required(),
    }).required(),
})

module.exports.reviewSchema = joi.object({
    rating: joi.number().min(1).max(5).required(),
    comment: joi.string().min(1).required(),
});
