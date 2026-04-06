const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { supplierValidator } = require('../validators/supplierValidator');
const validate = require('../middleware/validateMiddleware');

router.use(protect);
router.route('/').get(getSuppliers).post(supplierValidator, validate, createSupplier);
router.route('/:id').get(getSupplier).put(updateSupplier).delete(deleteSupplier);

module.exports = router;
