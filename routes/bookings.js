const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");

// middleware
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    next();
}

// confirm payment & save booking
router.post("/confirm", isLoggedIn, async (req, res) => {
    const data = req.session.bookingData;

    if (!data) {
        return res.redirect("/listings");
    }
    const basePrice = data.totalPrice;
    const gst = Math.round(basePrice * 0.18);
    const finalTotal = basePrice + gst;


    const newBooking = new Booking({
        listing: data.listingId,
        user: req.user._id,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        totalPrice: data.totalPrice
    });

    await newBooking.save();

    req.flash("success", "Payment successful 💳 Booking confirmed 🎉");
    req.session.bookingData = null;

    res.redirect("/bookings");
});

// show payment page
router.get("/payment", isLoggedIn, async (req, res) => {
    const booking = req.session.bookingData;

    if (!booking) {
        req.flash("error", "Session expired");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(booking.listingId);

    res.render("bookings/payment", { booking, listing });
});

// create booking → redirect to payment
router.post("/:id", isLoggedIn, async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing");
        return res.redirect(req.get("Referrer") || "/listings");
    }

    const { checkIn, checkOut } = req.body;

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (endDate <= startDate) {
        req.flash("error", "Invalid booking dates");
        return res.redirect(req.get("Referrer") || "/listings");
    }

    const existingBookings = await Booking.find({
        listing: listing._id,
        $or: [
            {
                checkIn: { $lt: endDate },
                checkOut: { $gt: startDate }
            }
        ]
    });

    if (existingBookings.length > 0) {
        req.flash("error", "These dates are already booked");
        return res.redirect(req.get("Referrer") || "/listings");
    }

    const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const totalPrice = days * listing.price;

    req.session.bookingData = {
        listingId: listing._id,
        checkIn: startDate,
        checkOut: endDate,
        totalPrice
    };

    res.redirect("/bookings/payment");
});

// show user bookings
router.get("/", isLoggedIn, async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing");

    res.render("bookings/index", { bookings });
});

// cancel booking
router.delete("/:id", async (req, res) => {
    await Booking.findByIdAndDelete(req.params.id);
    req.flash("success", "Booking cancelled successfully ❌");
    res.redirect("/bookings");
});

module.exports = router;