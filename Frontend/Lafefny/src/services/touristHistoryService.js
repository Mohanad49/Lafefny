import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Get all booked activities and itineraries for a tourist by user ID
export const getTouristBookings = (userID) => {
  return axios.get(`${API_URL}/tourist/touristHistory/${userID}`);
};

export const addActivityReview = (activityId, review) => {
  return axios.post(`${API_URL}/tourist/activities/${activityId}/reviews`, review);
};

// Submit a review for an itinerary
export const addItineraryReview = (itineraryId, review) => {
  return axios.post(`${API_URL}/tourist/itineraries/${itineraryId}/reviews`, review);
};

// Submit a review for a tour guide
export const addTourGuideReview = (tourGuideName, review) => {
  return axios.post(`${API_URL}/tourist/tour-guides/${tourGuideName}/reviews`, review);
};
