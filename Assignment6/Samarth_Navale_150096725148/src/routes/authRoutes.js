const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validator');

router.post('/register', validateRegister, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.get('/profile', auth, ctrl.getProfile);
router.put('/profile', auth, ctrl.updateProfile);

module.exports = router;

