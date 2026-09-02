const BookModel = require('../models/bookModel');
const TransactionModel = require('../models/transactionModel');

const getAllBooks = async (req, res, next) => {
  try {
    const { category, status, author } = req.query;
    const list = await BookModel.getAllBooks({ category, status, author });
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (e) {
    next(e);
  }
};

const searchBooks = async (req, res, next) => {
  try {
    const q = req.query.q || req.query.query || req.query.title || '';
    if (!q) return res.status(400).json({ success: false, message: 'Query param q required' });

    const list = await BookModel.searchBooks(q);
    return res.status(200).json({ success: true, count: list.length, data: list });
  } catch (e) {
    next(e);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const bk = await BookModel.findById(req.params.id);
    if (!bk) return res.status(404).json({ success: false, message: 'Book not found' });
    return res.status(200).json({ success: true, data: bk });
  } catch (e) {
    next(e);
  }
};

const addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const bk = await BookModel.createBook({ title, author, isbn, category, quantity });
    return res.status(201).json({ success: true, message: 'Book added', data: bk });
  } catch (e) {
    next(e);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const id = req.params.id;
    const exist = await BookModel.findById(id);
    if (!exist) return res.status(404).json({ success: false, message: 'Book not found' });

    const updated = await BookModel.updateBook(id, req.body);
    return res.status(200).json({ success: true, message: 'Book updated', data: updated });
  } catch (e) {
    next(e);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const id = req.params.id;
    const del = await BookModel.deleteBook(id);
    if (!del) return res.status(404).json({ success: false, message: 'Book not found' });
    return res.status(200).json({ success: true, message: 'Book deleted' });
  } catch (e) {
    next(e);
  }
};

const borrowBook = async (req, res, next) => {
  try {
    const bId = req.params.id;
    const uId = req.user.userId;

    const bk = await BookModel.findById(bId);
    if (!bk) return res.status(404).json({ success: false, message: 'Book not found' });
    if (bk.quantity <= 0 || bk.status === 'borrowed') {
      return res.status(400).json({ success: false, message: 'Book unavailable' });
    }

    const active = await TransactionModel.findActiveBorrow(uId, bId);
    if (active) {
      return res.status(400).json({ success: false, message: 'Already borrowed' });
    }

    const tx = await TransactionModel.createTransaction({ userId: uId, bookId: bId });
    const rem = bk.quantity - 1;
    await BookModel.updateBook(bId, { quantity: rem, status: rem > 0 ? 'available' : 'borrowed' });

    return res.status(200).json({
      success: true,
      message: 'Book borrowed',
      data: { transaction: tx, remainingQuantity: rem }
    });
  } catch (e) {
    next(e);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const bId = req.params.id;
    const uId = req.user.userId;

    const bk = await BookModel.findById(bId);
    if (!bk) return res.status(404).json({ success: false, message: 'Book not found' });

    const active = await TransactionModel.findActiveBorrow(uId, bId);
    if (!active) return res.status(400).json({ success: false, message: 'No active borrow found' });

    const tx = await TransactionModel.markAsReturned(active.transactionId);
    const curr = bk.quantity + 1;
    await BookModel.updateBook(bId, { quantity: curr, status: 'available' });

    return res.status(200).json({
      success: true,
      message: 'Book returned',
      data: { transaction: tx, currentQuantity: curr }
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getAllBooks,
  searchBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
};

