import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const getItineraries = () => {
  return axios.get(`${API_URL}/itineraries`);
};

export const getItinerary = (id) => {
  return axios.get(`${API_URL}/itineraries/${id}`);
};

export const addItinerary = (itinerary) => {
  return axios.post(`${API_URL}/itineraries`, itinerary);
};

export const editItinerary = (id, updatedItinerary) => {
  return axios.put(`${API_URL}/itineraries/${id}`, updatedItinerary);
};

export const deleteItinerary = (id) => {
  return axios.delete(`${API_URL}/itineraries/${id}`);
};