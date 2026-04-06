const Inventory = require('../models/inventoryModel');
const Product = require('../models/productModel');

// @desc    Get all inventory transactions
// @route   GET /api/inventory
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { product = '', type = '', page = 1, limit = 20 } = req.query;
    const query = {};
    if (product) query.product = product;
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Inventory.countDocuments(query);
    const transactions = await Inventory.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create inventory transaction (stock in or out)
// @route   POST /api/inventory
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { product: productId, type, quantity, note } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // For stock out, ensure sufficient quantity
    if (type === 'out' && product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.quantity}`,
      });
    }

    // Update product quantity
    const newQty = type === 'in'
      ? product.quantity + Number(quantity)
      : product.quantity - Number(quantity);

    await Product.findByIdAndUpdate(productId, { quantity: newQty });

    const transaction = await Inventory.create({
      product: productId,
      type,
      quantity: Number(quantity),
      note,
      performedBy: req.user._id,
    });

    const populated = await transaction.populate([
      { path: 'product', select: 'name sku' },
      { path: 'performedBy', select: 'name' },
    ]);

    res.status(201).json({
      success: true,
      message: `Stock ${type === 'in' ? 'added' : 'removed'} successfully`,
      data: populated,
      updatedQuantity: newQty,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions, createTransaction };
