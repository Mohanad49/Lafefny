import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getActivities = () => {
  return axios.get(`${API_URL}/activities`);
};

export const getActivityById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/activities/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }
};

export const addActivity = (activity) => {
  return axios.post(`${API_URL}/activities`, activity);
};

export const updateActivity = (id, updatedActivity) => {
  return axios.put(`${API_URL}/activities/${id}`, updatedActivity);
};

export const deleteActivity = (id) => {
  return axios.delete(`${API_URL}/activities/${id}`);
};
