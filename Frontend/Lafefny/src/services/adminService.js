import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Add a Tourism Governor
export const addTourismGovernor = (userData) => {
  return axios.post(`${API_URL}/admin/add-tourism-governor`, userData);
};

// Add another Admin
export const addAdmin = (userData) => {
  return axios.post(`${API_URL}/admin/add-admin`, userData);
};

// Fetch all users
export const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };
  
  // Delete a user by ID
  export const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };