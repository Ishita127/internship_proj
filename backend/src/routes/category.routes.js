import { Router } from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();
router.get('/', getCategories);
router.post('/', protect, requirePermission('createAny', 'product'), createCategory); // Admin only
router.delete('/:id', protect, requirePermission('deleteAny', 'product'), deleteCategory); // Admin only
export default router;