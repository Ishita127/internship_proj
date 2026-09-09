export const cartSchema = (body) => {
    if (!body.product_id) return { error: 'Product ID is required' };
    if (!body.quantity || body.quantity < 1) return { error: 'Valid quantity is required' };
    if (body.quantity > 100) return { error: 'Quantity cannot exceed 100' };
  return { error: null };
};