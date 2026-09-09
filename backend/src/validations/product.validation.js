export const productSchema = (body) => {
  if (!body.name) return { error: 'Product name is required' };
  if (!body.price || body.price < 0) return { error: 'Valid price is required' };
  if (body.stock < 0) return { error: 'Stock cannot be negative' };
  return { error: null };
};