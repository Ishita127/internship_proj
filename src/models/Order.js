import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_amount: { type: Number, required: true },
  payment_method: { type: String, default: 'Simulated' },
  payment_status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  order_status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'], 
    default: 'Pending' 
  },
  delivery_address: { type: String, required: true },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }]
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export default mongoose.model('Order', orderSchema);