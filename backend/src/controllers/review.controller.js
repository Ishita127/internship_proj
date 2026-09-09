import Review from '../models/Review.js';

export const getProductReviews = async (req, res, next) => {
  try { res.status(200).json(await Review.find({ product_id: req.params.productId }).populate('user_id', 'name')); } catch (e) { next(e); }
};
export const addReview = async (req, res, next) => {
  try { res.status(201).json(await Review.create({ user_id: req.user._id, ...req.body })); } catch (e) { next(e); }
};