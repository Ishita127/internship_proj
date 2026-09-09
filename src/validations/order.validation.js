export const orderSchema = (body) => {
  if (!body.delivery_address) return { error: 'Delivery address is required' };
  if (!body.items || body.items.length === 0) return { error: 'Order must contain items' };
  return { error: null };
};