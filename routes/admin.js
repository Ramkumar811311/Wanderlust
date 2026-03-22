const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");

// middleware
function isAdmin(req, res, next) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        req.flash("error", "Access denied");
        return res.redirect("/listings");
    }
    next();
}

// ADMIN DASHBOARD
router.get("/", isAdmin, async (req, res) => {
    const users = await User.find({});
    const listings = await Listing.find({}).populate("owner");
    const bookings = await Booking.find({})
        .populate("user")
        .populate("listing");

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.render("admin/dashboard", {
        users,
        listings,
        bookings,
        totalRevenue
    });
});

// promote user → host
router.post("/users/:id/promote", isAdmin, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { role: "host" });
    res.redirect("/admin");
});

// delete user
router.delete("/users/:id", isAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
});

// delete listing
router.delete("/listings/:id", isAdmin, async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
});

module.exports = router;