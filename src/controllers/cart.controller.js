import * as cartService from '../services/cart.service.js';

export const getCart = async (req, res, next) => {
  try { res.status(200).json(await cartService.getCart(req.user._id)); } catch (e) { next(e); }
};
export const addToCart = async (req, res, next) => {
  try { res.status(201).json(await cartService.addToCart(req.user._id, req.body)); } catch (e) { next(e); }
};
export const updateCartItem = async (req, res, next) => {
  try { res.status(200).json(await cartService.updateCart(req.params.id, req.body.quantity)); } catch (e) { next(e); }
};
export const removeFromCart = async (req, res, next) => {
  try { res.status(200).json(await cartService.removeCartItem(req.params.id)); } catch (e) { next(e); }
};