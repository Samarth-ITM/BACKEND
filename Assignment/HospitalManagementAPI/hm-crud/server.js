const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const db = require("./config/db");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });

            if (!user) {
                return done(null, false);
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return done(null, false);
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

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

app.use(session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes);
app.use("/", hospitalRoutes);

app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});
