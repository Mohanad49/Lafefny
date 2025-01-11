import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/preferenceTag`;


  // Create a new preference tag
  export const createPreferenceTag = async (data) => {
    try {
      const response = await axios.post(API_URL, data);
      return response.data;
    } catch (error) {
      console.error('Error creating preference tag:', error);
      throw error;
    }
  }

  // Get all preference tags
  export const getAllPreferenceTags = async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching preference tags:', error);
      throw error;
    }
}

  // Update a preference tag
  export const updatePreferenceTag =  async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating preference tag:', error);
      throw error;
    }
  }

  // Delete a preference tag
export const deletePreferenceTag = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting preference tag:', error);
      throw error;
    }
  }
