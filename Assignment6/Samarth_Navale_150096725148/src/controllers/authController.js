const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const exist = await UserModel.findByEmail(email);
    if (exist) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const usr = await UserModel.createUser({
      name,
      email,
      password: hash,
      role: role || 'student'
    });

    const tok = generateToken({ userId: usr.userId, email: usr.email, role: usr.role });
    const { password: _, ...safe } = usr;

    return res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: { user: safe, token: tok }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usr = await UserModel.findByEmail(email);
    if (!usr) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, usr.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const tok = generateToken({ userId: usr.userId, email: usr.email, role: usr.role });
    const { password: _, ...safe } = usr;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: safe, token: tok }
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const usr = await UserModel.findById(req.user.userId);
    if (!usr) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _, ...safe } = usr;
    return res.status(200).json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const uid = req.user.userId;

    const up = {};
    if (name) up.name = name;
    if (email) {
      const exist = await UserModel.findByEmail(email);
      if (exist && exist.userId !== uid) {
        return res.status(400).json({ success: false, message: 'Email in use' });
      }
      up.email = email;
    }

    const updated = await UserModel.updateUser(uid, up);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _, ...safe } = updated;
    return res.status(200).json({ success: true, message: 'Profile updated', data: safe });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile };

