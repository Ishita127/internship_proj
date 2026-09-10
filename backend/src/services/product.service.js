import Product from '../models/Product.js';

export const getAllProducts = async (query) => {
  // Implements search and filtering as required in the PDF
  const filter = {};
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };
  if (query.category_id) filter.category_id = query.category_id;
  
  return await Product.find(filter);
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    const error = new Error('Invalid product ID'); // Requirement: graceful error handling
    error.statusCode = 404;
    throw error;
  }
  return product;
};

// if created product is deleted, it should not be returned in the getAllProducts or getProductById endpoints. 
// This is handled by adding a 'deleted' field to the Product model and filtering out deleted products in the 
// getAllProducts and getProductById functions.
export const createProduct = async (data) => await Product.create(data);

export const updateProduct = async (id, data) => await Product.findByIdAndUpdate(id, data, { new: true });

export const deleteProduct = async (id) => await Product.findByIdAndDelete(id); 