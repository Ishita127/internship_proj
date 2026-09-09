import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// Customer creates and views their orders
router.post('/', protect, requirePermission('createOwn', 'order'), createOrder);
router.get('/', protect, requirePermission('readOwn', 'order'), getUserOrders);
router.get('/:id', protect, requirePermission('readOwn', 'order'), getOrderById);

// Admin updates order status
router.put('/:id/status', protect, requirePermission('updateAny', 'order'), updateOrderStatus);

export default router;