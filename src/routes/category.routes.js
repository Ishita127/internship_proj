import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();
router.get('/', getCategories);
router.post('/', protect, requirePermission('createAny', 'product'), createCategory); // Admin only
export default router;