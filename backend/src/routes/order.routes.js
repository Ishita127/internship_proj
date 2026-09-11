import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import { protect, restrictTo} from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// Customer creates and views their orders || admin can not add to cart or place order now - bug solved
router.post('/', protect, restrictTo('customer'), requirePermission('createOwn', 'order'), createOrder);
router.get('/', protect, restrictTo('customer'), requirePermission('readOwn', 'order'), getUserOrders);
router.get('/:id', protect, restrictTo('customer'), requirePermission('readOwn', 'order'), getOrderById);

// Admin updates order status
router.put('/:id/status', protect, requirePermission('updateAny', 'order'), updateOrderStatus);

export default router;