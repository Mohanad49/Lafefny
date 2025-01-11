import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, { email, password });
      const { token, id, role, username } = response.data;
      
      setAuthToken(token);
      localStorage.setItem('userID', id);
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', username);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during login' };
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      const { token, id } = response.data;
      
      setAuthToken(token);
      localStorage.setItem('userID', id);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('username', userData.username);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during registration' };
    }
  },

  logout: () => {
    setAuthToken(null);
    localStorage.removeItem('userID');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    const userID = localStorage.getItem('userID');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    if (token && userID) {
      return {
        id: userID,
        role: userRole,
        username: username
      };
    }
    return null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  hasRole: (requiredRole) => {
    const userRole = localStorage.getItem('userRole');
    return userRole === requiredRole;
  },

  // Initialize authentication state from localStorage
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }
};

export default authService;
