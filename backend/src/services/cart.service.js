import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (user_id) => {
    const cartItems = await Cart.find({ user_id }).populate('product_id');

    // calculate subtotal, delivery charges, discount, and total
    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += (item.product_id.price * item.quantity);
    });

    let delivery_charges = 0; 
    if (subtotal > 0 && subtotal <= 500) {
        delivery_charges = 50;
    }
    const discount = 0; // You can dynamically change this later if you add coupons

    // 4. Safely calculate the final total
    let finalTotal = subtotal + delivery_charges - discount;
    finalTotal = Math.max(0, finalTotal);

    return {
        items: cartItems,
        summary:{
            subtotal,
            delivery_charges,
            discount,
            total: finalTotal
        }
    }
}
    
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