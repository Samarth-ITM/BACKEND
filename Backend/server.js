const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let hotels = [];
let users = [];


app.get("/", (req, res) => {
    try {
        res.status(200).json({ message: "Welcome to Hotel API" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.post("/register", (req, res) => {
    try {
        const newUser = {
            id: users.length + 1,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        };

        users.push(newUser);

        res.status(201).json({
            message: "User Registered Successfully",
            user: newUser
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.post("/login", (req, res) => {
    try {
        const user = users.find(
            u =>
                u.username === req.body.username &&
                u.password === req.body.password
        );

        if (!user) {
            return res.status(404).json({
                message: "Invalid Username or Password"
            });
        }

        res.status(200).json({
            message: "Login Successful",
            user
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.post("/hotels", (req, res) => {
    try {
        const newHotel = {
            id: hotels.length + 1,
            name: req.body.name,
            location: req.body.location,
            rating: req.body.rating,
            pricePerNight: req.body.pricePerNight
        };

        hotels.push(newHotel);

        res.status(201).json({
            message: "Hotel Added Successfully",
            hotel: newHotel
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get("/hotels", (req, res) => {
    try {
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get("/hotels/:id", (req, res) => {
    try {
        const hotel = hotels.find(h => h.id == req.params.id);

        if (!hotel) {
            return res.status(404).json({
                message: "Hotel Not Found"
            });
        }

        res.status(200).json(hotel);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.put("/hotels/:id", (req, res) => {
    try {
        const hotel = hotels.find(h => h.id == req.params.id);

        if (!hotel) {
            return res.status(404).json({
                message: "Hotel Not Found"
            });
        }

        hotel.name = req.body.name;
        hotel.location = req.body.location;
        hotel.rating = req.body.rating;
        hotel.pricePerNight = req.body.pricePerNight;

        res.status(200).json({
            message: "Hotel Updated Successfully",
            hotel
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.delete("/hotels/:id", (req, res) => {
    try {
        const hotelIndex = hotels.findIndex(h => h.id == req.params.id);

        if (hotelIndex === -1) {
            return res.status(404).json({
                message: "Hotel Not Found"
            });
        }

        hotels.splice(hotelIndex, 1);

        res.status(200).json({
            message: "Hotel Deleted Successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});