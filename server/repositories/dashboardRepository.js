const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Supplier = require('../models/supplierModel');
const Inventory = require('../models/inventoryModel');

const productProjection = 'name sku quantity minStock unit price createdAt category supplier';
const inventoryProjection = 'product type quantity note performedBy createdAt';

const countProducts = async () => Product.countDocuments();
const countCategories = async () => Category.countDocuments();
const countSuppliers = async () => Supplier.countDocuments();
const countLowStockProducts = async () =>
  Product.countDocuments({ $expr: { $lte: ['$quantity', '$minStock'] } });
const countOutOfStockProducts = async () => Product.countDocuments({ quantity: 0 });

const getTotalInventoryQuantity = async () =>
  Product.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]);

const getInventoryValue = async () =>
  Product.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }]);

const getInventorySummaryByType = async (filter = {}) => {
  const match = {};
  if (filter.start) {
    match.createdAt = { $gte: filter.start };
  }
  if (filter.end) {
    match.createdAt = match.createdAt ? { ...match.createdAt, $lte: filter.end } : { $lte: filter.end };
  }

  const summary = await Inventory.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        quantity: { $sum: '$quantity' },
      },
    },
  ]);

  return summary.reduce(
    (acc, item) => {
      acc[item._id] = { count: item.count, quantity: item.quantity };
      return acc;
    },
    { in: { count: 0, quantity: 0 }, out: { count: 0, quantity: 0 } }
  );
};

const getRecentProducts = async (limit = 5) =>
  Product.find()
    .select(productProjection)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);

const getRecentInventory = async (limit = 6) =>
  Inventory.find()
    .select(inventoryProjection)
    .populate('product', 'name sku')
    .sort({ createdAt: -1 })
    .limit(limit);

const getRecentPurchases = async (limit = 5) =>
  Inventory.find({ type: 'in' })
    .select(inventoryProjection)
    .populate('product', 'name sku')
    .sort({ createdAt: -1 })
    .limit(limit);

const getRecentSales = async (limit = 5) =>
  Inventory.find({ type: 'out' })
    .select(inventoryProjection)
    .populate('product', 'name sku')
    .sort({ createdAt: -1 })
    .limit(limit);

const getLowStockProducts = async (limit = 5) =>
  Product.find({ $expr: { $lte: ['$quantity', '$minStock'] } })
    .select(productProjection)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ quantity: 1 })
    .limit(limit);

const getTopSellingProducts = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return Inventory.aggregate([
    { $match: { type: 'out', createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: '$product',
        totalSold: { $sum: '$quantity' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        name: '$product.name',
        sku: '$product.sku',
        totalSold: 1,
        orderCount: 1,
      },
    },
  ]);
};

const getCategoryDistribution = async () =>
  Product.aggregate([
    {
      $group: {
        _id: '$category',
        value: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        label: '$category.name',
        value: 1,
      },
    },
    { $sort: { value: -1 } },
  ]);

const getSupplierDistribution = async () =>
  Product.aggregate([
    {
      $group: {
        _id: '$supplier',
        value: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'suppliers',
        localField: '_id',
        foreignField: '_id',
        as: 'supplier',
      },
    },
    { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        supplierId: '$_id',
        label: '$supplier.name',
        value: 1,
      },
    },
    { $sort: { value: -1 } },
  ]);

const getMonthlyMovement = async (type) => {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const match = { createdAt: { $gte: rangeStart } };
  if (type) match.type = type;

  return Inventory.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        total: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

const getInventoryGrowth = async () => {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  return Inventory.aggregate([
    { $match: { createdAt: { $gte: rangeStart } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type',
        },
        total: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

const getWeeklySales = async () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return Inventory.aggregate([
    { $match: { type: 'out', createdAt: { $gte: start } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        total: { $sum: '$quantity' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);
};

module.exports = {
  countProducts,
  countCategories,
  countSuppliers,
  countLowStockProducts,
  countOutOfStockProducts,
  getTotalInventoryQuantity,
  getInventoryValue,
  getInventorySummaryByType,
  getRecentProducts,
  getRecentInventory,
  getRecentPurchases,
  getRecentSales,
  getLowStockProducts,
  getTopSellingProducts,
  getCategoryDistribution,
  getSupplierDistribution,
  getMonthlyMovement,
  getInventoryGrowth,
  getWeeklySales,
};
