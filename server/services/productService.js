const productRepository = require('../repositories/productRepository');

/**
 * Redesign the Product page using a single optimized initialization API.
 * Uses Promise.all() to execute independent queries concurrently.
 */
const initializeProductPage = async (filters) => {
  const {
    search = '',
    category = '',
    supplier = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = filters;

  // Build MongoDB query object
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (supplier) {
    query.supplier = supplier;
  }

  // Handle various status filters
  if (status) {
    if (status === 'active') {
      query.quantity = { $gt: 0 };
    } else if (status === 'inactive' || status === 'out_of_stock') {
      query.quantity = 0;
    } else if (status === 'low_stock') {
      query.$expr = { $lte: ['$quantity', '$minStock'] };
    } else if (status === 'in_stock') {
      query.$expr = { $gt: ['$quantity', '$minStock'] };
    }
  }

  // Parse sorting fields dynamically and safely
  const sortObj = {};
  const validSortFields = ['name', 'sku', 'price', 'quantity', 'createdAt', 'expiryDate'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const order = sortOrder === 'asc' ? 1 : -1;
  sortObj[field] = order;

  // Calculate pagination parameters
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  // Run independent database queries concurrently using Promise.all()
  const [
    products,
    total,
    categories,
    suppliers,
    statistics,
  ] = await Promise.all([
    productRepository.getProducts({ query, skip, limit: limitNum, sort: sortObj }),
    productRepository.countProducts(query),
    productRepository.getAllCategories(),
    productRepository.getAllSuppliers(),
    productRepository.getStatistics(),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    products: {
      rows: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    },
    categories,
    suppliers,
    statistics,
  };
};

module.exports = {
  initializeProductPage,
};
