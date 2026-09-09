import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// Only Admins can view dashboard stats
router.get('/stats', protect, requirePermission('readAny', 'order'), getDashboardStats);

export default router;