import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/museumTags`;

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
