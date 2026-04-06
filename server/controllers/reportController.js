const Inventory = require('../models/inventoryModel');
const Product = require('../models/productModel');

// Helper to get date range
const getDateRange = (type) => {
  const now = new Date();
  let start;
  if (type === 'daily') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (type === 'weekly') {
    const day = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else {
    // monthly
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { start, end: now };
};

// @desc    Get stock report
// @route   GET /api/reports
// @access  Private
const getReport = async (req, res, next) => {
  try {
    const { type = 'daily' } = req.query;
    const { start, end } = getDateRange(type);

    // Aggregated transactions in date range
    const transactions = await Inventory.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$type',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Top moved products
    const topProducts = await Inventory.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$product',
          totalMoved: { $sum: '$quantity' },
        },
      },
      { $sort: { totalMoved: -1 } },
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
          totalMoved: 1,
        },
      },
    ]);

    // Daily trend for charts (last 30 days for monthly / last 7 for weekly / today's hours for daily)
    const trend = await Inventory.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type',
          },
          total: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Summary stats
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minStock'] },
    });
    const totalStockValue = await Product.aggregate([
      { $group: { _id: null, value: { $sum: { $multiply: ['$price', '$quantity'] } } } },
    ]);

    const stockIn = transactions.find((t) => t._id === 'in') || { totalQuantity: 0, count: 0 };
    const stockOut = transactions.find((t) => t._id === 'out') || { totalQuantity: 0, count: 0 };

    res.json({
      success: true,
      data: {
        period: type,
        dateRange: { start, end },
        summary: {
          totalProducts,
          lowStockCount,
          totalStockValue: totalStockValue[0]?.value || 0,
          stockIn: { totalQuantity: stockIn.totalQuantity, transactions: stockIn.count },
          stockOut: { totalQuantity: stockOut.totalQuantity, transactions: stockOut.count },
        },
        topProducts,
        trend,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReport };
