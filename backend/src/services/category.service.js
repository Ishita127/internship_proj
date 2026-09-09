import Category from '../models/Category.js';

export const getAllCategories = async () => await Category.find();
export const createCategory = async (data) => await Category.create(data);