import Category from '../models/Category.js';
import Product from '../models/Product.js';

export const getAllCategories = async () => await Category.find();
export const createCategory = async (data) => await Category.create(data);

export const getCategoryById = async (categoryId) => await Category.findById(categoryId);

export const countProductsInCategory = async (categoryId) => {
  return await Product.countDocuments({ category_id: categoryId });
};

export const deleteCategoryAndProducts = async (categoryId, hasProducts) => {
  if (hasProducts) {
    await Product.deleteMany({ category_id: categoryId });
  }
  await Category.findByIdAndDelete(categoryId);
};