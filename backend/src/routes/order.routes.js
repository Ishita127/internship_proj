import { Router } from 'express';

import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/order.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();

// Customer creates orders
router.post(
    '/',
    protect,
    restrictTo('customer'),
    requirePermission('createOwn', 'order'),
    createOrder
);

// Customer and Admin can view orders according to their permissions
// logic was flawed. if a customer tries to access another customer's order, it should be denied. 
// So, we will use requirePermission middleware to check if the user has permission to read the order.
// bug fixed in controller by checking if the order belongs to the user for customers. Admins can access any order.
router.get(
    '/',
    protect,
    getUserOrders
);

router.get(
    '/:id',
    protect,
    requirePermission('readOwn', 'order'),
    getOrderById
);

// Admin updates order status
router.put(
    '/:id/status',
    protect,
    restrictTo('admin'),
    requirePermission('updateAny', 'order'),
    updateOrderStatus
);

export default router;