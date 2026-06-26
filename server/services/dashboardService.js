const dashboardRepository = require('../repositories/dashboardRepository');
const { getCache, setCache, delCache } = require('../config/cache');

const DASHBOARD_CACHE_KEY = 'dashboard:summary';
const DASHBOARD_CACHE_TTL = Number(process.env.DASHBOARD_CACHE_TTL || 60);

const formatTimeSeries = (labels, raw, valueField = 'total') => {
  const map = raw.reduce((acc, item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    acc[key] = item[valueField] || 0;
    return acc;
  }, {});

  return labels.map((label) => ({
    label: label.label,
    value: map[label.key] || 0,
  }));
};

const buildMonthLabels = (months = 6) => {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
    };
  });
};

const buildWeekLabels = () => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      label: date.toLocaleString('default', { weekday: 'short' }),
    };
  });
};

const normalizeMonthlyGrowth = (raw) => {
  const grouped = raw.reduce((acc, item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    acc[key] = acc[key] || { in: 0, out: 0 };
    acc[key][item._id.type] = item.total;
    return acc;
  }, {});

  return buildMonthLabels().map((label) => ({
    label: label.label,
    value: (grouped[label.key]?.in || 0) - (grouped[label.key]?.out || 0),
  }));
};

const buildWeeklySales = (raw) => {
  const map = raw.reduce((acc, item) => {
    const date = new Date(item._id.year, item._id.month - 1, item._id.day);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    acc[key] = item.total;
    return acc;
  }, {});

  return buildWeekLabels().map((label) => ({
    label: label.label,
    value: map[label.key] || 0,
  }));
};

const getDashboard = async () => {
  const cached = await getCache(DASHBOARD_CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  const [
    totalProducts,
    totalCategories,
    totalSuppliers,
    lowStockCount,
    outOfStockCount,
    inventoryQuantityResult,
    inventoryValueResult,
    inventorySummary,
    todayInventorySummary,
    recentProducts,
    recentInventory,
    recentPurchases,
    recentSales,
    lowStockProducts,
    topSellingProducts,
    categoryDistribution,
    supplierDistribution,
    monthlySalesRaw,
    monthlyPurchasesRaw,
    inventoryGrowthRaw,
    weeklySalesRaw,
  ] = await Promise.all([
    dashboardRepository.countProducts(),
    dashboardRepository.countCategories(),
    dashboardRepository.countSuppliers(),
    dashboardRepository.countLowStockProducts(),
    dashboardRepository.countOutOfStockProducts(),
    dashboardRepository.getTotalInventoryQuantity(),
    dashboardRepository.getInventoryValue(),
    dashboardRepository.getInventorySummaryByType(),
    dashboardRepository.getInventorySummaryByType({ start: new Date(new Date().setHours(0, 0, 0, 0)) }),
    dashboardRepository.getRecentProducts(5),
    dashboardRepository.getRecentInventory(6),
    dashboardRepository.getRecentPurchases(5),
    dashboardRepository.getRecentSales(5),
    dashboardRepository.getLowStockProducts(5),
    dashboardRepository.getTopSellingProducts(),
    dashboardRepository.getCategoryDistribution(),
    dashboardRepository.getSupplierDistribution(),
    dashboardRepository.getMonthlyMovement('out'),
    dashboardRepository.getMonthlyMovement('in'),
    dashboardRepository.getInventoryGrowth(),
    dashboardRepository.getWeeklySales(),
  ]);

  const statistics = {
    totalProducts,
    totalCategories,
    totalSuppliers,
    totalInventory: inventoryQuantityResult[0]?.total || 0,
    totalPurchaseOrders: inventorySummary.in.count,
    totalSalesOrders: inventorySummary.out.count,
    lowStockCount,
    outOfStockCount,
    inventoryValue: inventoryValueResult[0]?.total || 0,
    todaysPurchases: todayInventorySummary.in.count,
    todaysSales: todayInventorySummary.out.count,
  };

  const monthLabels = buildMonthLabels();

  const charts = {
    monthlySales: formatTimeSeries(monthLabels, monthlySalesRaw),
    monthlyPurchases: formatTimeSeries(monthLabels, monthlyPurchasesRaw),
    inventoryGrowth: normalizeMonthlyGrowth(inventoryGrowthRaw),
    categoryDistribution,
    supplierDistribution,
    weeklySales: buildWeeklySales(weeklySalesRaw),
  };

  const activities = recentInventory.map((item) => ({
    id: item._id,
    type: item.type,
    quantity: item.quantity,
    note: item.note || '',
    product: item.product,
    createdAt: item.createdAt,
  }));

  const payload = {
    statistics,
    charts,
    recentProducts,
    recentInventory,
    recentPurchases,
    recentSales,
    lowStockProducts,
    topSellingProducts,
    activities,
  };

  await setCache(DASHBOARD_CACHE_KEY, JSON.stringify(payload), DASHBOARD_CACHE_TTL);
  return payload;
};

const invalidateDashboardCache = async () => {
  await delCache(DASHBOARD_CACHE_KEY);
};

module.exports = { getDashboard, invalidateDashboardCache };
