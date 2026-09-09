import mongoose from 'mongoose';
import { ROLES } from '../roles/roles.list.js';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    address: { 
      type: String, 
      required: true 
    }
  },
  { 
    timestamps: { createdAt: 'created_at', updatedAt: false } 
  }
);

export default mongoose.model('User', userSchema);