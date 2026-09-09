import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// Public routes for Customers
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes for Administrators
router.post('/', protect, requirePermission('createAny', 'product'), createProduct);
router.put('/:id', protect, requirePermission('updateAny', 'product'), updateProduct);
router.delete('/:id', protect, requirePermission('deleteAny', 'product'), deleteProduct);

export default router;