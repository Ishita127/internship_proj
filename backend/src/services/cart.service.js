import Cart from '../models/Cart.js';

export const getCart = async (user_id) => await Cart.find({ user_id }).populate('product_id');
export const addToCart = async (user_id, data) => await Cart.create({ user_id, ...data });
export const updateCart = async (id, quantity) => await Cart.findByIdAndUpdate(id, { quantity }, { new: true });
export const removeCartItem = async (id) => {
  await Cart.findByIdAndDelete(id);
  return { status: 'success', message: 'Item removed' };
};