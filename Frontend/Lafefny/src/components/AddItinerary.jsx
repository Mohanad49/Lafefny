/* eslint-disable no-unused-vars */
import React from 'react';
import AddForm from './AddForm';
import { addItinerary } from '../services/itineraryService';

const AddItinerary = () => {
  const fields = [
    { label: 'Activities', name: 'activities', type: 'text', required: true },
    { label: 'Locations', name: 'locations', type: 'text', required: true },
    { label: 'Timeline', name: 'timeline', type: 'text', required: true },
    { label: 'Duration (hours)', name: 'duration', type: 'number', required: true },
    { label: 'Language', name: 'language', type: 'text', required: true },
    { label: 'Price', name: 'price', type: 'number', required: true },
    { label: 'Available Dates', name: 'availableDates', type: 'date', required: true },
    { label: 'Accessibility', name: 'accessibility', type: 'text', required: true },
    { label: 'Pick-Up Location', name: 'pickUpLocation', type: 'text', required: true },
    { label: 'Drop-Off Location', name: 'dropOffLocation', type: 'text', required: true },
    { label: 'Preferences', name: 'preferences', type: 'text', required: false },
  ];

  const handleItinerarySubmit = async (formData) => {
    try {
      await addItinerary(formData);
      alert('Itinerary added successfully');
    } catch (error) {
      console.error('Error adding itinerary:', error);
      alert('Error adding itinerary');
    }
  };

  return <AddForm title="Add New Itinerary" fields={fields} submitHandler={handleItinerarySubmit} />;
};

export default AddItinerary;
