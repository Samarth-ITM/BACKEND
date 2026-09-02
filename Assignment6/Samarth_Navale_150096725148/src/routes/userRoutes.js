const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { validateUpdateRole } = require('../middleware/validator');

router.get('/', auth, role('librarian'), ctrl.getAllUsers);
router.get('/:id', auth, role('librarian'), ctrl.getUserById);
router.put('/:id/role', auth, role('librarian'), validateUpdateRole, ctrl.updateUserRole);
router.delete('/:id', auth, role('librarian'), ctrl.deleteUser);

module.exports = router;

