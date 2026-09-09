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