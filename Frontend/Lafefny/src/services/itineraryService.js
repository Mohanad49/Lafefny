import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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

export const getItineraryById = (id) => {
  return axios.get(`${API_URL}/itineraries/${id}`);
};

export const updateItineraryStatus = (id, isActive) => {
  return axios.patch(`${API_URL}/itineraries/${id}/toggleActive`, { isActive });
};

export const updateItineraryInappropriateFlag = (id, inappropriateFlag) => {
  return axios.patch(`${API_URL}/itineraries/${id}/toggleInappropriate`, { inappropriateFlag });
};

// For admin use
export const getAdminItineraries = () => {
  return axios.get(`${API_URL}/itineraries/admin`);
};

// For regular users
export const getUserItineraries = (userId, params = {}) => {
  return axios.get(`${API_URL}/itineraries/user`, {
    params: {
      userId,
      ...params
    }
  });
};

export const bookItinerary = (itineraryId, userId, selectedDate) => {
  return axios.post(`${API_URL}/itineraries/${itineraryId}/book`, {
    userId,
    selectedDate: new Date(selectedDate).toISOString()
  });
};

// In ItineraryService.js - Add cancel booking function
export const cancelBooking = (itineraryId, userId) => {
  return axios.post(`${API_URL}/itineraries/${itineraryId}/cancel`, { 
    userId: userId 
  });
};