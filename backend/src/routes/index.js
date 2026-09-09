import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import cartRoutes from './cart.routes.js';
import categoryRoutes from './category.routes.js';
import reviewRoutes from './review.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);

export default router;