require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospital_management";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB database:", mongoose.connection.name))
  .catch((err) => console.log("MongoDB connection error:", err));

module.exports = mongoose;
