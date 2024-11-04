import axios from 'axios';

const API_URL = 'http://localhost:8000/museumTags'; // Adjust this URL as needed

export const addMuseumTag = async (tagData) => {
  try {
    const response = await axios.post(API_URL, tagData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getAllMuseumTags = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
