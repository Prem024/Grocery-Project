const dashboardService = require('../services/dashboardService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboard();
    res.status(200).json({
      success: true,
      message: 'Dashboard loaded successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
