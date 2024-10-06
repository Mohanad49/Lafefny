/* eslint-disable no-unused-vars */
import React from 'react';
import AddForm from './AddForm';
import { addItinerary } from '../services/itineraryService';

const AddItinerary = () => {
  const fields = [
    { label: 'Name', name: 'name', type: 'text', required: true },
    { label: 'Activities (comma-separated)', name: 'activities', type: 'text', required: true },
    { label: 'Locations (comma-separated)', name: 'locations', type: 'text', required: true },
    { label: 'Timeline (comma-separated)', name: 'timeline', type: 'text', required: true },
    { label: 'Duration (hours)', name: 'duration', type: 'number', required: true },
    { label: 'Language', name: 'language', type: 'text', required: true },
    { label: 'Price', name: 'price', type: 'number', required: true },
    { label: 'Available Dates (comma-separated YYYY-MM-DD)', name: 'availableDates', type: 'text', required: true },
    { label: 'Accessibility', name: 'accessibility', type: 'text', required: true },
    { label: 'Pick-Up Location', name: 'pickUpLocation', type: 'text', required: true },
    { label: 'Drop-Off Location', name: 'dropOffLocation', type: 'text', required: true },
    { label: 'Preferences', name: 'preferences', type: 'text', required: false },
  ];

  const handleItinerarySubmit = async (formData) => {
    try {
      // Convert comma-separated strings to arrays
      const processedData = {
        ...formData,
        activities: formData.activities.split(',').map(item => item.trim()),
        locations: formData.locations.split(',').map(item => item.trim()),
        timeline: formData.timeline.split(',').map(item => item.trim()),
        duration: [Number(formData.duration)], // Convert to array of numbers
        price: Number(formData.price), // Ensure price is a number
        availableDates: formData.availableDates.split(',').map(date => {
          const [year, month, day] = date.trim().split('-');
          return new Date(Date.UTC(year, month - 1, day)).toISOString();
        }),
        ratings: 0, // Set initial rating to 0
      };

      console.log('Processed data:', processedData); // Log the processed data for debugging

      const response = await addItinerary(processedData);
      console.log('Server response:', response);
      alert('Itinerary added successfully');
    } catch (error) {
      console.error('Error adding itinerary:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
      }
      alert('Error adding itinerary: ' + (error.response?.data?.error || error.message));
    }
  };

  return <AddForm title="Add New Itinerary" fields={fields} submitHandler={handleItinerarySubmit} />;
};

export default AddItinerary;
