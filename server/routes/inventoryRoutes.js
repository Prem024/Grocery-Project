const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { inventoryValidator } = require('../validators/inventoryValidator');
const validate = require('../middleware/validateMiddleware');

router.use(protect);
router.route('/').get(getTransactions).post(inventoryValidator, validate, createTransaction);

module.exports = router;
