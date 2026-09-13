import User from '../models/User.js';
import Wishlist from '../models/WishList.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const addToWishlist = async (userId, productId) => {

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        const error = new Error('Invalid product ID');
        error.statusCode = 400;
        throw error;
    }

    const product = await Product.findById(productId);

    if (!product) {
        const error = new Error('Product does not exist');
        error.statusCode = 404;
        throw error;
    }

    const alreadyExists = await Wishlist.findOne({
        user_id: userId,
        product_id: productId
    });

    if (alreadyExists) {
        return alreadyExists;
    }

    return await Wishlist.create({
        user_id: userId,
        product_id: productId
    });
};

export const getWishlist = async (userId) => await Wishlist.find({ user_id: userId }).populate('product_id');

export const removeFromWishlist = async (userId, wishlistId) => {
    await Wishlist.findOneAndDelete({
        _id: wishlistId,
        user_id: userId
    });

    return { message: 'Removed from wishlist' };
};

export const getUserById = async (id) => await User.findById(id).select('-password');

export const updateUser = async (id, data) => await User.findByIdAndUpdate(id, data, { new: true }).select('-password');

export const getAllCustomers = async () => await User.find({ role: 'customer' }).select('-password');

export const deleteUser = async (id) => await User.findByIdAndDelete(id);