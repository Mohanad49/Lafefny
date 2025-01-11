import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL}/notifications`;

const notificationService = {
  getNotifications: async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await axios.patch(`${BASE_URL}/${notificationId}/read`);
    return response.data;
  }
};

export default notificationService;