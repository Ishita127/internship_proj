import crypto from 'crypto';
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
    },

    /*---------------for password reset functionality----------------*/
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },

  },
  { 
    timestamps: { createdAt: 'created_at', updatedAt: false } 
  }
);

//----------- TO GENERATE TOKEN FOR PASSWORD RESET FUNCTIONALITY -----------
userSchema.methods.createPasswordResetToken = function() {
  // 1. Generate a random 32-character string
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash it to save in the database securely
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // 3. Set expiration time to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 4. Return the plain token so we can email it
  return resetToken;
};

export default mongoose.model('User', userSchema);