import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/emails.js';
import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error); // Passes error to the centralized handler in app.js
  }
};

export const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.status(200).json({ status: 'success', data: { token, user } });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // For JWT, logout is usually handled client-side by deleting the token.
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

// --- 1. SEND THE RESET EMAIL ---
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const error = new Error('There is no user with that email address.');
      error.statusCode = 404;
      throw error;
    }

    // Generate token and save to database
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send the email to Mailtrap Sandbox
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Forgot your password? Click here to reset it:\n${resetURL}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message: message,
      });

      res.status(200).json({ status: 'success', message: 'Token sent to email!' });
     } 
     catch (err) {
    console.log('EMAIL ERROR:', err);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const error = new Error(`Email sending failed: ${err.message}`);
    error.statusCode = 500;
    throw error;
}
  } catch (error) {
    next(error);
  }
};

// --- 2. RESET THE PASSWORD ---
export const resetPassword = async (req, res, next) => {
  try {
    // 1. Hash the token from the URL to match what is saved in the DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Find the user with this token, AND make sure it hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() } // $gt means "greater than" right now
    });

    if (!user) {
      const error = new Error('Token is invalid or has expired');
      error.statusCode = 400;
      throw error;
    }

    // 3. Update the password
    user.password = req.body.password;
    
    // 4. Wipe the reset token fields so they can't be used again
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password successfully updated!'
    });
  } catch (error) {
    next(error);
  }
};