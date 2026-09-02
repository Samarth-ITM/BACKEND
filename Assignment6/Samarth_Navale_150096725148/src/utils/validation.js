const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errs.array().map(e => ({
        field: e.param || e.path,
        message: e.msg
      }))
    });
  }
  next();
};

module.exports = { validate };

