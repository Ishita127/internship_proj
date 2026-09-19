import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Authentication
 *
 * Automatically attach the JWT token to every API request
 * when the user is logged in.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * Products
 */
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/*
 * Categories
 *
 * Backend returns the category array directly.
 */

/* Categories */

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};

/*
 * Reviews
 *
 * Backend returns the reviews array directly.
 */
export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/${productId}`);
  return response.data;
};

export const addProductReview = async (reviewData) => {
  const response = await api.post("/reviews", reviewData);
  return response.data;
};

/*
 * Authentication
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, {
    password,
  });

  return response.data;
};

/*
 * Cart
 *
 * All cart endpoints require authentication.
 */
export const getCart = async () => {
  const response = await api.get("/cart");

  return response.data;
};

export const addCartItem = async (productId, quantity = 1) => {
  const response = await api.post("/cart", {
    product_id: productId,
    quantity,
  });

  return response.data;
};

export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.put(`/cart/${cartItemId}`, {
    quantity,
  });

  return response.data;
};

export const removeCartItem = async (cartItemId) => {
  const response = await api.delete(`/cart/${cartItemId}`);

  return response.data;
};

/*
 * Wishlist
 *
 * All wishlist endpoints require authentication.
 */
export const getWishlist = async () => {
  const response = await api.get("/users/wishlist");

  return response.data;
};

export const addWishlistItem = async (productId) => {
  const response = await api.post("/users/wishlist", {
    product_id: productId,
  });

  return response.data;
};

export const removeWishlistItem = async (wishlistId) => {
  const response = await api.delete(
    `/users/wishlist/${wishlistId}`
  );

  return response.data;
};

/* Orders */
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/* Admin Dashboard */
export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const response = await api.put(`/orders/${id}/status`, {
    order_status: orderStatus,
  });

  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export default api;