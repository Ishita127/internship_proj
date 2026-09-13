import * as userService from '../services/user.service.js';

export const getProfile = async (req, res, next) => {
  try { res.status(200).json(await userService.getUserById(req.user._id)); } catch (e) { next(e); }
};
export const updateProfile = async (req, res, next) => {
  try { const safeData = {};
    if (req.body.name) safeData.name = req.body.name;
    if (req.body.phone) safeData.phone = req.body.phone;
    if (req.body.address) safeData.address = req.body.address;

    // 2. Pass our safeData object instead of the dangerous req.body
    const updatedUser = await userService.updateUser(req.user._id, safeData);
    
    res.status(200).json(updatedUser); } catch (e) { next(e); }
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