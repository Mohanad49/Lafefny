/* eslint-disable no-useless-catch */
// src/services/signService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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
  try{
    const response = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: data
        }
      };
    }
    return data; 
  }
  catch (error) {
    throw error;
  };
};
