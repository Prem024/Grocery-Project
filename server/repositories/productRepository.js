const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Supplier = require('../models/supplierModel');

/**
 * Fetch products matching filters with projection, pagination, sorting
 */
const getProducts = async ({ query, skip, limit, sort }) => {
  return Product.find(query)
    .select('name sku category supplier price quantity minStock unit expiryDate description createdAt')
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * Count total products matching filters
 */
const countProducts = async (query = {}) => {
  return Product.countDocuments(query);
};

/**
 * Fetch all categories with minimal attributes
 */
const getAllCategories = async () => {
  return Category.find({}, 'name').sort({ name: 1 });
};

/**
 * Fetch all suppliers with minimal attributes
 */
const getAllSuppliers = async () => {
  return Supplier.find({}, 'name').sort({ name: 1 });
};

/**
 * Compute global statistics for the products
 */
const getStatistics = async () => {
  const [totalProducts, activeProducts, inactiveProducts, lowStockProducts] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ quantity: { $gt: 0 } }),
    Product.countDocuments({ quantity: 0 }),
    Product.countDocuments({ $expr: { $lte: ['$quantity', '$minStock'] } }),
  ]);

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    lowStockProducts,
  };
};

module.exports = {
  getProducts,
  countProducts,
  getAllCategories,
  getAllSuppliers,
  getStatistics,
};
