import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getActivities = () => {
  return axios.get(`${API_URL}/activities`);
};

export const addActivity = (activity) => {
  return axios.post(`${API_URL}/activities`, activity);
};

export const editActivity = (id, updatedActivity) => {
  return axios.put(`${API_URL}/activities/${id}`, updatedActivity);
};

export const deleteActivity = (id) => {
  return axios.delete(`${API_URL}/activities/${id}`);
};
