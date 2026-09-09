import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try { res.status(200).json(await Category.find()); } catch (e) { next(e); }
};
export const createCategory = async (req, res, next) => {
  try { res.status(201).json(await Category.create(req.body)); } catch (e) { next(e); }
};