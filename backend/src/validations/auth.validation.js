export const registerSchema = (body) => {
  if (!body.email || !body.email.includes('@')) return { error: 'Valid email is required' };
  if (!body.password || body.password.length < 6) return { error: 'Password must be at least 6 characters' };
  if (!body.name) return { error: 'Name is required' };
  if (!body.phone) return { error: 'Phone number is required' };
  if (!body.address) return { error: 'Address is required' };
  
  return { error: null };
};