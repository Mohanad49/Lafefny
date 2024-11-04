import axios from 'axios';

const API_URL = 'http://localhost:8000/activityCategory'; 

export const createActivityCategory = async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating activity category:', error);
      throw error;
    }
  }

  // Get all activity categories
export const getAllActivityCategories = async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity categories:', error);
      throw error;
    }
}

  // Update an activity category
export const updateActivityCategory = async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating activity category:', error);
      throw error;
    }
}

  // Delete an activity category
export const deleteActivityCategory = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting activity category:', error);
      throw error;
    }
}
