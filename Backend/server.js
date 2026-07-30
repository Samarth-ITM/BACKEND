const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

let users = [];
let hotels = [];

// Passport
passport.use(
    new LocalStrategy(async (username, password, done) => {

        const user = users.find(u => u.username === username);

        if (!user) {
            return done(null, false);
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return done(null, false);
        }

        return done(null, user);

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
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// Welcome Route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Hotel APIs"
    });
});


// Register
app.post("/register", async (req, res) => {

    try {

        const hash = await bcrypt.hash(req.body.password, 10);

        const user = {
            id: users.length + 1,
            username: req.body.username,
            email: req.body.email,
            password: hash
        };

        users.push(user);

        res.status(201).json({
            message: "User Registered Successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

});


// Login
app.post("/login",

    passport.authenticate("local"),

    (req, res) => {

        res.json({
            message: "Login Successful"
        });

    }

);


// Add Hotel
app.post("/hotels", (req, res) => {

    try {

        const existingHotel = hotels.find(
            h => h.name === req.body.name
        );

        if (existingHotel) {
            return res.status(400).json({
                message: "Hotel already exists"
            });
        }

        const hotel = {

            id: hotels.length + 1,
            name: req.body.name,
            location: req.body.location,
            rating: req.body.rating,
            pricePerNight: req.body.pricePerNight

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


// Get All Hotels + Filter
app.get("/hotels", (req, res) => {

    try {

        if (req.query.rating) {

            const filtered = hotels.filter(
                h => h.rating == req.query.rating
            );

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

    const hotel = hotels.find(
        h => h.id == req.params.id
    );

    if (!hotel) {

        return res.status(404).json({
            message: "Hotel Not Found"
        });

    }

    res.json(hotel);

});


// Update Hotel
app.put("/hotels/:id", (req, res) => {

    const hotel = hotels.find(
        h => h.id == req.params.id
    );

    if (!hotel) {

        return res.status(404).json({
            message: "Hotel Not Found"
        });

    }

    hotel.name = req.body.name;
    hotel.location = req.body.location;
    hotel.rating = req.body.rating;
    hotel.pricePerNight = req.body.pricePerNight;

    res.json({

        message: "Hotel Updated Successfully",
        hotel

    });

});


// Delete Hotel
app.delete("/hotels/:id", (req, res) => {

    const index = hotels.findIndex(
        h => h.id == req.params.id
    );

    if (index == -1) {

        return res.status(404).json({
            message: "Hotel Not Found"
        });

    }

    hotels.splice(index, 1);

    res.json({
        message: "Hotel Deleted Successfully"
    });

});


app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});