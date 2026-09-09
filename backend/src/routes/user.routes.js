import { Router } from 'express';
import { getProfile, updateProfile, getAllCustomers, getWishlist, addToWishlist, removeFromWishlist } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

const router = Router();
router.use(protect); // All routes here require login

// Customer Profile
router.get('/profile', requirePermission('readOwn', 'profile'), getProfile);
router.put('/profile', requirePermission('updateOwn', 'profile'), updateProfile);

// Wishlist
router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Admin Customer Management
router.get('/', requirePermission('readAny', 'profile'), getAllCustomers);

export default router;