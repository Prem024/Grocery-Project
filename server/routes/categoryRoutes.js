const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { categoryValidator } = require('../validators/categoryValidator');
const validate = require('../middleware/validateMiddleware');

router.use(protect);
router.route('/').get(getCategories).post(categoryValidator, validate, createCategory);
router.route('/:id').get(getCategory).put(updateCategory).delete(deleteCategory);

module.exports = router;
