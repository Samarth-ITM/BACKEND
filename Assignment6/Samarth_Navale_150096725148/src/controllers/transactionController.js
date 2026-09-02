const TransactionModel = require('../models/transactionModel');

const getAllTransactions = async (req, res, next) => {
  try {
    const list = await TransactionModel.getAllTransactions();
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (e) {
    next(e);
  }
};

const getMyTransactions = async (req, res, next) => {
  try {
    const uid = req.user.userId;
    const list = await TransactionModel.getTransactionsByUserId(uid);
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getAllTransactions,
  getMyTransactions
};

