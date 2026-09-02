const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { validateBook } = require('../middleware/validator');

router.get('/', ctrl.getAllBooks);
router.get('/search', ctrl.searchBooks);
router.get('/:id', ctrl.getBookById);

router.post('/', auth, role('librarian'), validateBook, ctrl.addBook);
router.put('/:id', auth, role('librarian'), ctrl.updateBook);
router.delete('/:id', auth, role('librarian'), ctrl.deleteBook);

router.post('/:id/borrow', auth, role('student'), ctrl.borrowBook);
router.post('/:id/return', auth, role('student'), ctrl.returnBook);

module.exports = router;

