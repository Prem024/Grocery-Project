const { body } = require('express-validator');

const inventoryValidator = [
  body('product').notEmpty().withMessage('Product is required'),
  body('type').isIn(['in', 'out']).withMessage('Type must be in or out'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
];

module.exports = { inventoryValidator };
