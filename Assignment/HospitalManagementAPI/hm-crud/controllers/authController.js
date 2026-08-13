const bcrypt = require("bcryptjs");
const User = require("../models/User");

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "User Registered Successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const login = (req, res) => {
    res.json({
        message: "Login Successful"
    });
};

module.exports = {
    register,
    login
};
