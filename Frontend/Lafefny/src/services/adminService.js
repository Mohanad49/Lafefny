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
      await axios.delete(`${API_URL}/admin/delete-account/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };


    // Accept user
export const acceptUser = async (userId) => {
  await axios.put(`${API_URL}/admin/accept/${userId}`);
};

// Reject user
export const rejectUser = async (userId) => {
  await axios.put(`${API_URL}/admin/reject/${userId}`);
};


  
export const viewAdvertiser_pdf = (userId) => {
  return (`${API_URL}/advertiser/getPDF/${userId}`);
};

export const viewSeller_pdf = async (userId) => {
  return (`${API_URL}/seller/getPDF/${userId}`);
};

export const viewTourGuide_pdf = async (userId) => {
  return (`${API_URL}/tourGuide/getPDF/${userId}`);
};
