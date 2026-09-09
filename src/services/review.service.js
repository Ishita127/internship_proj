import Review from '../models/Review.js';

export const getReviewsByProduct = async (productId) => {
  return await Review.find({ product_id: productId }).populate('user_id', 'name');
};
export const createReview = async (userId, reviewData) => {
  return await Review.create({ user_id: userId, ...reviewData });
};