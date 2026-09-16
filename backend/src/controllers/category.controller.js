import Category from '../models/Category.js';
import * as categoryService from '../services/category.service.js';

export const getCategories = async (req, res, next) => {
  try { res.status(200).json(await Category.find()); } catch (e) { next(e); }
};
export const createCategory = async (req, res, next) => {
  try { res.status(201).json(await Category.create(req.body)); } catch (e) { next(e); }
};

export const deleteCategory = async (req, res, next) => {
    try {
      const categoryId = req.params.id;
// 1. Ask the service if the category exists
    const category = await categoryService.getCategoryById(categoryId);
    if (!category) {
      const error = new Error('No category found with that ID');
      error.statusCode = 404;
      throw error;
    }

    // 2. Ask the service to count the products
    const productCount = await categoryService.countProductsInCategory(categoryId);

    // 3. THE WARNING
    if (productCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        status: 'warning',
        message: `WARNING: This category contains ${productCount} products. Deleting it will permanently delete those products too. To proceed, append ?force=true to your URL.`
      });
    }

    // 4. THE CASCADE DELETE (Handled entirely by the service)
    await categoryService.deleteCategoryAndProducts(categoryId, productCount > 0);

    res.status(200).json({ 
      status: 'success', 
      message: `Category and ${productCount} associated products deleted successfully.` 
    });
  } catch (e) { 
    next(e); 
  }
};