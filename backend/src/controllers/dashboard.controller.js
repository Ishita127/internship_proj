import * as dashboardService from '../services/dashboard.service.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getAdminStats();
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};