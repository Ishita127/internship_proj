import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(userData.password);
  
  const user = await User.create({
    ...userData,
    password: hashedPassword
  });

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid login credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid login credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET || 'fallback_secret_key', 
    { expiresIn: '1d' }
  );

  const userObj = user.toObject();
  delete userObj.password;
  
  return { token, user: userObj };
};  