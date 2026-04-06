const { body } = require('express-validator');

const supplierValidator = [
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

module.exports = { supplierValidator };
