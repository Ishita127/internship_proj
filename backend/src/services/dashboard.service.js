import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getAdminStats = async () => {
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  
  const pendingOrders = await Order.countDocuments({ order_status: 'Pending' });
  const completedOrders = await Order.countDocuments({ order_status: 'Delivered' });
  
  const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name stock'); // Assuming < 5 is low stock

  // Calculate total revenue from all delivered orders
  const revenueResult = await Order.aggregate([
    { $match: { order_status: 'Delivered' } },
    { $group: { _id: null, totalRevenue: { $sum: '$total_amount' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  return {
    totalCustomers,
    totalProducts,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue,
    lowStockProducts
  };
};