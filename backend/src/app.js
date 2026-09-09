import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';

// 1. Import all your individual route files directly
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import categoryRoutes from './routes/category.routes.js';
import reviewRoutes from './routes/review.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

// 2. Global Middlewares
app.use(cors());
app.use(express.json());

// 3. Health Check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'E-Commerce API is running...' });
});

// 4. Mount all APIs separately so you know exactly what is active
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 5. Global Error Handler (Must be last)
app.use(errorHandler);

export default app;