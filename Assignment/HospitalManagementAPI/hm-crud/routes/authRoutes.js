const express = require("express");
const passport = require("passport");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", passport.authenticate("local"), login);

module.exports = router;
