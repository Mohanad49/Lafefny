import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/touristItinerary`;

export const addTouristItinerary = async (itineraryData) => {
    const response = await axios.post(API_URL, itineraryData);
    return response.data;
};


export const getAllTouristItineraries = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const updateTouristItinerary = async (id, itineraryData) => {
    const response = await axios.put(`${API_URL}/${id}`, itineraryData);
    return response.data;
};

export const deleteTouristItinerary = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const getTouristItineraryById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};