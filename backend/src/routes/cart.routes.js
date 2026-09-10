import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cart.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();
// All cart routes require login
// Only users can access cart routes
router.use(protect, restrictTo('user')); 

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);

export default router;