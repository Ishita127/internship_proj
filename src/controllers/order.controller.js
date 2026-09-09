import * as orderService from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    res.status(201).json({ status: 'success', data: order });
  } catch (error) { next(error); }
};

export const getUserOrders = async (req, res, next) => {
  try {
    // If admin, they can read any. If customer, only read their own.
    const userId = req.user.role === 'admin' ? null : req.user._id;
    const orders = await orderService.getOrders(userId);
    res.status(200).json({ status: 'success', data: orders });
  } catch (error) { next(error); }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json({ status: 'success', data: order });
  } catch (error) { next(error); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.order_status);
    res.status(200).json({ status: 'success', data: order });
  } catch (error) { next(error); }
};