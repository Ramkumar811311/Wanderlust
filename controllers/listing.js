const Listing = require("../models/listing")

module.exports.index = async (req, res) => {

    let { category, location } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    if (location) {
        filter.location = { $regex: location, $options: "i" };
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", {
        allListings,
        category,
        location
    });
};

module.exports.RenderNewForm = async (req, res) => {

    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing })
}

module.exports.createListing = async (req, res, next) => {
    try {

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        // Image upload
        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            newListing.image = { url, filename };
        }

        // Get coordinates from location
        let location = req.body.listing.location;

        let geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

        let response = await fetch(geoUrl, {
            headers: {
                "User-Agent": "wanderlust-app"
            }
        });

        let data = await response.json();

        if (data.length > 0) {
            newListing.geometry = {
                type: "Point",
                coordinates: [
                    parseFloat(data[0].lon),
                    parseFloat(data[0].lat)
                ]
            };
        } else {
            req.flash("error", "Location not found!");
            return res.redirect("/listings/new");
        }

        await newListing.save();

        req.flash("success", "New Listing Created!");
        res.redirect("/listings");

    } catch (err) {
        next(err);
    }
};

module.exports.RenderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/,w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl })
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (
        !listing.owner.equals(req.user._id) &&
        req.user.role !== "admin"
    ) {
        req.flash("error", "You are not authorized!");
        return res.redirect(`/listings/${id}`);
    }

    let updated = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        updated.image = { url, filename };
        await updated.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.DestroyListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    // 👑 Admin OR Owner
    if (
        !listing.owner.equals(req.user._id) &&
        req.user.role !== "admin"
    ) {
        req.flash("error", "You are not authorized!");
        return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};