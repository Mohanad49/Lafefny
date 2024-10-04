// src/services/signService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Sign up function
export const signUp = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'An error occurred during sign up';
  }
};

// Sign in function
export const signIn = async (email, password) => {
    const response = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to sign in');
    }
  
    const data = await response.json();
    return data; 
  };
  
