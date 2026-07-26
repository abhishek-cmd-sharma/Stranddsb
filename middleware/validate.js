const { validationResult } = require('express-validator');

/**
 * Run validation result check after express-validator rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Express-Validator Error:', errors.array().map((e) => e.msg).join(', '));
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validate;
