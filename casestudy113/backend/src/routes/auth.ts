import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Student } from "../models/Student";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "warden" ? "warden" : "student";

    const user = await Student.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      authProvider: "local"
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login" });
  }
});

// Google Sign-In: Syncs user into MongoDB Atlas and returns JWT session
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { name, email, role, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required for Google Sign-In" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await Student.findOne({ email: normalizedEmail });

    if (user) {
      if (name && !user.name) user.name = name;
      if (avatar) user.avatar = avatar;
      if (googleId) user.googleId = googleId;
      await user.save();
    } else {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8) + Date.now().toString(),
        10
      );
      const userRole = role === "warden" ? "warden" : "student";

      user = await Student.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: randomPassword,
        role: userRole,
        authProvider: "google",
        avatar: avatar || "",
        googleId: googleId || ""
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Google authentication successful and saved in MongoDB",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ message: "Server error during Google authentication" });
  }
});

// Get current user details from MongoDB
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await Student.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user from database" });
  }
});

// Update profile / role in MongoDB database
router.patch("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, role } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (role && (role === "student" || role === "warden")) updates.role = role;

    const user = await Student.findByIdAndUpdate(req.user?.id, updates, {
      new: true
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    return res.json({
      message: "User profile updated successfully in MongoDB",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile in database" });
  }
});

export default router;

