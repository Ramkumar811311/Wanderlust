const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require('../models/listing.js');

const { isLoggedIn, isOwner, validateListing, isHost } = require("../middleware.js");
const ListingController = require("../controllers/listing.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ===============================
// 📌 INDEX + CREATE ROUTE
// ===============================
router.route("/")
.get(wrapAsync(ListingController.index))
.post(
isLoggedIn,
isHost, // 🔐 Only host can create
upload.single("listing[image]"),
validateListing,
wrapAsync(ListingController.createListing)
);

// ===============================
// 📌 NEW LISTING FORM
// ===============================
router.get(
"/new",
isLoggedIn,
isHost, // 🔐 Only host can access form
wrapAsync(ListingController.RenderNewForm)
);

// ===============================
// 📌 SEARCH
// ===============================
router.get("/search/:location", wrapAsync(ListingController.index));

// ===============================
// 📌 SHOW + UPDATE + DELETE
// ===============================
router.route("/:id")
.get(wrapAsync(ListingController.showListing))
.put(
isLoggedIn,
isOwner, // 👑 Only owner can edit
upload.single("listing[image]"),
validateListing,
wrapAsync(ListingController.updateListing)
)
.delete(
isLoggedIn,
isOwner, // 👑 Only owner can delete
wrapAsync(ListingController.DestroyListing)
);

// ===============================
// 📌 EDIT FORM
// ===============================
router.get(
"/:id/edit",
isLoggedIn,
isOwner, // 👑 Only owner
wrapAsync(ListingController.RenderEditForm)
);

module.exports = router;
