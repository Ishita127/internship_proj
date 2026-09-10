import Cart from '../models/Cart.js';

export const getCart = async (user_id) => await Cart.find({ user_id }).populate('product_id');

export const addToCart = async (user_id, data) => {
  const { product_id, quantity = 1 } = data;

  // bug 1: Verify the product actually exists before doing anything
  const productExists = await Cart.findOne({ product_id });
  if(!productExists) {
    const error = new Error('Product does not exist'); 
    error.statusCode = 404;
    throw error;
  }

  // bug 2: If the product already exists in the cart, update the quantity instead of creating a new entry
  const existingCartItem = await Cart.findOne({ user_id, product_id });
  if (existingCartItem) {
    existingCartItem.quantity += quantity;
    return await existingCartItem.save();
  }
  return await Cart.create({ user_id, ...data});
};

export const updateCart = async (id, quantity) => await Cart.findByIdAndUpdate(id, { quantity }, { new: true });

export const removeCartItem = async (id) => {
  await Cart.findByIdAndDelete(id);
  return { status: 'success', message: 'Item removed' };
};