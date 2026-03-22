const express = require("express");
const router = express.Router({ mergeParams: true });


const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing.js');
const Review = require("../models/review.js")

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")
const ReviewController = require("../controllers/reviews.js");


// Reviews
//Post route

router.post("/", isLoggedIn, validateReview, wrapAsync(ReviewController.createReview))

// review delete route

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(ReviewController.destroyReview))

module.exports = router;
