const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/my', auth, ctrl.getMyTransactions);
router.get('/', auth, role('librarian'), ctrl.getAllTransactions);

module.exports = router;

