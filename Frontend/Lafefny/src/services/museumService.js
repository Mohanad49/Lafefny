import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getMuseums = () => {
  return axios.get(`${API_URL}/museums`);
};

export const getMuseum = (id) => {
  return axios.get(`${API_URL}/museums/${id}`);
};

export const addMuseum = (museum) => {
  return axios.post(`${API_URL}/museums`, museum);
};

export const editMuseum = (id, updatedMuseum) => {
  return axios.put(`${API_URL}/museums/${id}`, updatedMuseum);
};

export const deleteMuseum = (id) => {
  return axios.delete(`${API_URL}/museums/${id}`);
};