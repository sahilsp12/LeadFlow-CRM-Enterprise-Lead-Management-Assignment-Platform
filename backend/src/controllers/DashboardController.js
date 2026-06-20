const DashboardService = require('../services/DashboardService');

class DashboardController {
  async getStats(req, res, next) {
    try {
      const stats = await DashboardService.getDashboardStats(req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        message: 'Dashboard stats calculated successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
