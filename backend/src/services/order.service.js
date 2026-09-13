import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const createOrder = async (userId, orderData) => {

  let calculatedSubtotal = 0;

  // Validate stock before placing order as required
  for (let item of orderData.items) {
    const product = await Product.findById(item.product_id);
    if (!product || product.stock < item.quantity) {
      const error = new Error(`Out-of-stock product or invalid quantity for ${item.product_id}`);
      error.statusCode = 400;
      throw error;
    }

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();

    // add actual database price to the subtotal
    calculatedSubtotal += (product.price * item.quantity);

    //3. do final math
    let delivery = 0;
    if (calculatedSubtotal > 0 && calculatedSubtotal <= 500) {
      delivery = 50;
    }
    const discount = orderData.discount || 0;    

    // Subtract the discount from the total
    let finalTotal = calculatedSubtotal + delivery - discount;

    finalTotal = Math.max(finalTotal, 0); // Ensure total is not negative
  }

  return await Order.create({
    user_id: userId,
    ...orderData,
    subtotal: calculatedSubtotal,
    delivery_charges: delivery,
    discount: discount,
    total: finalTotal
    });
};

export const getOrders = async (userId) => {
  const filter = userId ? { user_id: userId } : {};
  return await Order.find(filter).populate('items.product_id', 'name price');
};

export const getOrderById = async (id) => await Order.findById(id).populate('items.product_id');

export const updateOrderStatus = async (id, status) => {
  return await Order.findByIdAndUpdate(id, { order_status: status }, { new: true });
};