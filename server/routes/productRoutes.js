const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { productValidator } = require('../validators/productValidator');
const validate = require('../middleware/validateMiddleware');

router.use(protect);
router.get('/low-stock', getLowStockProducts);
router.route('/').get(getProducts).post(productValidator, validate, createProduct);
router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
