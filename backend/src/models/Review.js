import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Review', reviewSchema);