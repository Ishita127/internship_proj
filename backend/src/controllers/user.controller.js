import * as userService from '../services/user.service.js';

export const getProfile = async (req, res, next) => {
  try { res.status(200).json(await userService.getUserById(req.user._id)); } catch (e) { next(e); }
};
export const updateProfile = async (req, res, next) => {
  try { res.status(200).json(await userService.updateUser(req.user._id, req.body)); } catch (e) { next(e); }
};

export const deleteProfile = async (req, res, next) => {
  try { 
    res.status(200).json(await userService.deleteUser(req.params.id));

    res.status(200).json({ status:'success', message: 'User deleted successfully' });
   } catch (e) { 
    next(e); 
  }};

export const getAllCustomers = async (req, res, next) => {
  try { res.status(200).json(await userService.getAllCustomers()); } catch (e) { next(e); }
};
export const getWishlist = async (req, res, next) => {
  try { res.status(200).json(await userService.getWishlist(req.user._id)); } catch (e) { next(e); }
};
export const addToWishlist = async (req, res, next) => {
  try { res.status(201).json(await userService.addToWishlist(req.user._id, req.body.product_id)); } catch (e) { next(e); }
};
export const removeFromWishlist = async (req, res, next) => {
    try {
        res.status(200).json(
            await userService.removeFromWishlist(
                req.user._id,
                req.params.wishlistId
            )
        );
    } catch (e) {
        next(e);
    }
};