/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { addTouristItinerary } from '../services/touristItineraryService';

const AddTouristItinerary = () => {
  const [itinerary, setItinerary] = useState({
    name: '',
    activities: '',
    locations: '',
    tags: '',
    startDate: '',
    endDate: '',
    price: '',
    touristName: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedItinerary = {
        ...itinerary,
        activities: itinerary.activities.split(',').map(item => item.trim()),
        locations: itinerary.locations.split(',').map(item => item.trim()),
        tags: itinerary.tags.split(',').map(item => item.trim()),
        price: parseFloat(itinerary.price)
      };

      await addTouristItinerary(formattedItinerary);
      alert('Tourist Itinerary added successfully!');
      // Reset form or redirect user
      setItinerary({
        name: '',
        activities: '',
        locations: '',
        tags: '',
        startDate: '',
        endDate: '',
        price: '',
        touristName: ''
      });
    } catch (error) {
      console.error('Error adding tourist itinerary:', error);
      alert('Error adding tourist itinerary. Please try again.');
    }
  };

  return (
    <div>
      <h2>Add New Tourist Itinerary</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={itinerary.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="activities">Activities (comma-separated):</label>
          <input
            type="text"
            id="activities"
            name="activities"
            value={itinerary.activities}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="locations">Locations (comma-separated):</label>
          <input
            type="text"
            id="locations"
            name="locations"
            value={itinerary.locations}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="tags">Tags (comma-separated):</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={itinerary.tags}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={itinerary.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={itinerary.endDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={itinerary.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="touristName">Tourist Name:</label>
          <input
            type="text"
            id="touristName"
            name="touristName"
            value={itinerary.touristName}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Add Itinerary</button>
      </form>
    </div>
  );
};

export default AddTouristItinerary;
