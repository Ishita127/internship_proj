import User from '../models/User.js';
import Wishlist from '../models/WishList.js';

export const getUserById = async (id) => await User.findById(id).select('-password');
export const updateUser = async (id, data) => await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
export const getAllCustomers = async () => await User.find({ role: 'customer' }).select('-password');

export const getWishlist = async (userId) => await Wishlist.find({ user_id: userId }).populate('product_id');
export const addToWishlist = async (userId, productId) => await Wishlist.create({ user_id: userId, product_id: productId });
export const removeFromWishlist = async (userId, productId) => {
  await Wishlist.findOneAndDelete({ user_id: userId, product_id: productId });
  return { message: 'Removed from wishlist' };
};