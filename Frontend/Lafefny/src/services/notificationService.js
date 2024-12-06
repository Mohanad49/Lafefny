import axios from 'axios';

const BASE_URL = 'http://localhost:8000/notifications';

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