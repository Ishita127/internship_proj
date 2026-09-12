import { Router } from 'express';

import {
    getProfile,
    updateProfile,
    getAllCustomers,
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from '../controllers/user.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

import {
    requirePermission,
    customerOnly
} from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(protect); // All routes here require login

// Customer Profile
router.get(
    '/profile',
    customerOnly,
    requirePermission('readOwn', 'profile'),
    getProfile
);

router.put(
    '/profile',
    customerOnly,
    requirePermission('updateOwn', 'profile'),
    updateProfile
);

// Wishlist
router.get('/wishlist', customerOnly, getWishlist);

router.post('/wishlist', customerOnly, addToWishlist);

router.delete(
    '/wishlist/:wishlistId',
    customerOnly,
    removeFromWishlist
);

// Admin Customer Management
router.get(
    '/',
    requirePermission('readAny', 'profile'),
    getAllCustomers
);

export default router;