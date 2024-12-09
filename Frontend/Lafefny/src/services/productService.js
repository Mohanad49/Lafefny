import axios from 'axios';

const API_URL = 'http://localhost:8000/products'; // Adjust according to your backend URL

// Fetch all products
export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch a single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(API_URL, {
      ...productData,
      ownerID: localStorage.getItem('userID')
    });
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update an existing product by ID
export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, {
      ...productData,
      ownerID: localStorage.getItem('userID') // Include ownerID in update
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const fetchProducts = async (searchTerm, minPrice, maxPrice, sortBy) => {
  const query = new URLSearchParams();
  
  if (searchTerm) query.append('name', searchTerm);
  if (minPrice) query.append('minPrice', minPrice);
  if (maxPrice) query.append('maxPrice', maxPrice);
  if (sortBy) query.append('sortBy', sortBy);

  try {
    const response = await fetch(`${API_URL}/filter?${query.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading products:', error);
    throw error;
  }
};

// Add this new function
export const updateProductArchiveStatus = (id) => {
  return axios.patch(`${API_URL}/${id}/toggleArchive`);
};

// Add a review to a product
export const addProductReview = async (productId, review) => {
  try {
    const response = await axios.post(`${API_URL}/${productId}/reviews`, review);
    return response;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Check if user has purchased product
export const checkProductPurchase = async (userID, productId) => {
  try {
    console.log('Making request to:', `${API_URL}/check-purchase/${userID}/${productId}`);
    const response = await axios.get(`${API_URL}/check-purchase/${userID}/${productId}`);
    console.log('Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Full error object:', error);
    throw error;
  }
};

// Add to wishlist
export const addToWishlist = async (userID, productId) => {
  try {
    const response = await axios.post(`${API_URL}/wishlist/${userID}`, { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Add to cart
export const addToCart = async (userID, productId, quantity = 1) => {
  try {
    const response = await axios.post(`${API_URL}/cart/${userID}`, { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};