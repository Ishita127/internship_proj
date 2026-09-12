import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (user_id) =>
    await Cart.find({ user_id }).populate('product_id');

export const addToCart = async (user_id, data) => {
    const { product_id } = data;

    // 1. Check whether the product actually exists
    const product = await Product.findById(product_id);

    if (!product) {
        const error = new Error('Product does not exist');
        error.statusCode = 404;
        throw error;
    }

    // 2. Check whether this product is already in this user's cart
    const productExistsInCart = await Cart.findOne({
        user_id,
        product_id
    });

    // 3. If already in cart, do nothing
    if (productExistsInCart) {
        return productExistsInCart;
    }

    return await Cart.create({
        user_id,
        ...data
    });
};

export const updateCart = async (id, quantity) =>
    await Cart.findByIdAndUpdate(
        id,
        { quantity },
        { new: true }
    );

export const removeCartItem = async (id) => {
    await Cart.findByIdAndDelete(id);

    return {
        status: 'success',
        message: 'Item removed'
    };
};