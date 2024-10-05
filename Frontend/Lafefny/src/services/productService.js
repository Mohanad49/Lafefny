// src/services/productServices.js
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
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Add a new product
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(API_URL, productData);
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update an existing product by ID
export const editProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, productData);
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