import { Router } from 'express';

import {
    getProfile,
    updateProfile,
    deleteProfile,
    getAllCustomers,
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from '../controllers/user.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

import {
    requirePermission,
    //customerOnly
} from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(protect); // All routes here require login

// Customer Profile
router.get(
    '/profile',
    restrictTo('customer'),
    requirePermission('readOwn', 'profile'),
    getProfile
);

router.put(
    '/profile',
    restrictTo('customer'),
    requirePermission('updateOwn', 'profile'),
    updateProfile
);

router.delete(
    '/profile',
    requirePermission('deleteOwn', 'profile'),
    deleteProfile
)

// Wishlist
router.get('/wishlist', restrictTo('customer'), getWishlist);

router.post('/wishlist', restrictTo('customer'), addToWishlist);

router.delete(
    '/wishlist/:wishlistId',
    restrictTo('customer'),
    removeFromWishlist
);

// Admin Customer Management
router.get(
    '/',
    restrictTo('admin'),
    requirePermission('readAny', 'profile'),
    getAllCustomers
);

export default router;