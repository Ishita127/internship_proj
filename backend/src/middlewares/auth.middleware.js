import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { request } from 'express';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
  }
};

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to perform this action' });
    } 
    next();
  };
};