const UserModel = require('../models/userModel');

const getAllUsers = async (req, res, next) => {
  try {
    const list = await UserModel.getAllUsers();
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (e) {
    next(e);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const usr = await UserModel.findById(id);
    if (!usr) return res.status(404).json({ success: false, message: 'User not found' });

    const { password, ...safe } = usr;
    return res.status(200).json({ success: true, data: safe });
  } catch (e) {
    next(e);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { role } = req.body;

    const usr = await UserModel.findById(id);
    if (!usr) return res.status(404).json({ success: false, message: 'User not found' });

    const updated = await UserModel.updateUser(id, { role });
    const { password, ...safe } = updated;
    return res.status(200).json({ success: true, message: 'Role updated', data: safe });
  } catch (e) {
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id === req.user.userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    const del = await UserModel.deleteUser(id);
    if (!del) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};

