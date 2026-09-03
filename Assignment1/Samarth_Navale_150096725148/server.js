const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

let users = [];
let hotels = [];

// Passport Strategy Configuration
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = users.find(u => u.username === username);
            if (!user) {
                return done(null, false, { message: "Incorrect username." });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: "Incorrect password." });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id == id);
    done(null, user);
});

app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Welcome Route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Hotel APIs",
        status: "Online",
        endpoints: {
            register: "POST /register",
            login: "POST /login",
            getHotels: "GET /hotels",
            getHotelById: "GET /hotels/:id",
            addHotel: "POST /hotels",
            updateHotel: "PUT /hotels/:id",
            deleteHotel: "DELETE /hotels/:id"
        }
    });
});

// Register User
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this username or email"
            });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = {
            id: users.length + 1,
            username,
            email,
            password: hash
        };

        users.push(user);

        res.status(201).json({
            message: "User Registered Successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Login User
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            return res.json({
                message: "Login Successful",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    })(req, res, next);
});

// Add Hotel
app.post("/hotels", (req, res) => {
    try {
        const { name, location, rating, pricePerNight } = req.body;
        if (!name || !location) {
            return res.status(400).json({
                message: "Hotel name and location are required"
            });
        }

        const existingHotel = hotels.find(h => h.name.toLowerCase() === name.toLowerCase());
        if (existingHotel) {
            return res.status(400).json({
                message: "Hotel already exists"
            });
        }

        const hotel = {
            id: hotels.length + 1,
            name,
            location,
            rating: Number(rating) || 0,
            pricePerNight: Number(pricePerNight) || 0
        };

        hotels.push(hotel);

        res.status(201).json({
            message: "Hotel Added Successfully",
            hotel
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get All Hotels + Filter by Rating
app.get("/hotels", (req, res) => {
    try {
        if (req.query.rating) {
            const ratingNum = Number(req.query.rating);
            const filtered = hotels.filter(h => h.rating === ratingNum);
            return res.json(filtered);
        }
        res.json(hotels);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// Get Hotel By ID
app.get("/hotels/:id", (req, res) => {
    const hotel = hotels.find(h => h.id == req.params.id);
    if (!hotel) {
        return res.status(404).json({
            message: "Hotel Not Found"
        });
    }
    res.json(hotel);
});

// Update Hotel
app.put("/hotels/:id", (req, res) => {
    const hotel = hotels.find(h => h.id == req.params.id);
    if (!hotel) {
        return res.status(404).json({
            message: "Hotel Not Found"
        });
    }

    const { name, location, rating, pricePerNight } = req.body;
    if (name) hotel.name = name;
    if (location) hotel.location = location;
    if (rating !== undefined) hotel.rating = Number(rating);
    if (pricePerNight !== undefined) hotel.pricePerNight = Number(pricePerNight);

    res.json({
        message: "Hotel Updated Successfully",
        hotel
    });
});

// Delete Hotel
app.delete("/hotels/:id", (req, res) => {
    const index = hotels.findIndex(h => h.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({
            message: "Hotel Not Found"
        });
    }

    const deleted = hotels.splice(index, 1);
    res.json({
        message: "Hotel Deleted Successfully",
        hotel: deleted[0]
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on Port ${PORT}`);
    });
}

module.exports = app;