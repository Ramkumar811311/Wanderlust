const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


main().then(() => {
    console.log("connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});


async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "6990c9a0d39b90bcdc3b1d7d" }));
    await Listing.insertMany(initData.data)
    console.log("DB initialized with sample data");
}

initDB();