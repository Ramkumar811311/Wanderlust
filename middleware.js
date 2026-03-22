const Listing = require("./models/listing")
const Review = require("./models/review.js")
const ExpressError = require("./utils/ExpressError.js");
const { ListingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!")
        return res.redirect("/login")
    }
    next();
}

module.exports.isHost = (req, res, next) => {
    if (req.user && req.user.role === "host") {
        return next();
    }

    req.flash("error", "Only hosts can create listings!");
    res.redirect("/listings");
};
module.exports.isAdmin = (req, res, next) => {
    console.log("USER:", req.user);       
    console.log("ROLE:", req.user?.role);

    if (req.user && req.user.role === "admin") {
        return next();
    }

    req.flash("error", "Admin access only!");
    res.redirect("/listings");
};


module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "you are not owner of the listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error } = ListingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {

    console.log("BODY:", req.body); // 👈 keep for now

    if (!req.body.review) {
        throw new ExpressError(400, "Review is required");
    }

    const { error } = reviewSchema.validate(req.body.review);

    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "you are not author of this Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}