/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllTouristItineraries, updateTouristItinerary } from '../services/touristItineraryService';

const EditTouristItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState({
    name: '',
    activities: [],
    locations: [],
    tags: [],
    startDate: '',
    endDate: '',
    price: '',
    touristName: '',
    ratings: 0,
    preferences: '',
    language: ''
  });

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const itineraries = await getAllTouristItineraries();
        const currentItinerary = itineraries.find(item => item._id === id);
        if (currentItinerary) {
          setItinerary({
            ...currentItinerary,
            startDate: new Date(currentItinerary.startDate).toISOString().split('T')[0],
            endDate: new Date(currentItinerary.endDate).toISOString().split('T')[0],
          });
        }
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      }
    };

    fetchItinerary();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setItinerary(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTouristItinerary(id, {
        ...itinerary,
        price: Number(itinerary.price),
        ratings: Number(itinerary.ratings)
      });
      alert('Itinerary updated successfully');
      navigate('/guide-tourist-itineraries'); 
    } catch (error) {
      console.error('Error updating itinerary:', error);
      alert('Failed to update itinerary. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-itinerary-form">
      <h2>Edit Tourist Itinerary</h2>
      
      <label>
        Name:
        <input type="text" name="name" value={itinerary.name} onChange={handleChange} required />
      </label>

      <label>
        Activities (comma-separated):
        <input type="text" name="activities" value={itinerary.activities.join(', ')} onChange={(e) => handleArrayChange(e, 'activities')} required />
      </label>

      <label>
        Locations (comma-separated):
        <input type="text" name="locations" value={itinerary.locations.join(', ')} onChange={(e) => handleArrayChange(e, 'locations')} required />
      </label>

      <label>
        Tags (comma-separated):
        <input type="text" name="tags" value={itinerary.tags.join(', ')} onChange={(e) => handleArrayChange(e, 'tags')} />
      </label>

      <label>
        Start Date:
        <input type="date" name="startDate" value={itinerary.startDate} onChange={handleChange} required />
      </label>

      <label>
        End Date:
        <input type="date" name="endDate" value={itinerary.endDate} onChange={handleChange} required />
      </label>

      <label>
        Price:
        <input type="number" name="price" value={itinerary.price} onChange={handleChange} required />
      </label>

      <label>
        Tourist Name:
        <input type="text" name="touristName" value={itinerary.touristName} onChange={handleChange} required />
      </label>

      <label>
        Ratings:
        <input type="number" name="ratings" value={itinerary.ratings} onChange={handleChange} min="0" max="5" step="0.1" />
      </label>

      <label>
        Preferences:
        <input type="text" name="preferences" value={itinerary.preferences} onChange={handleChange} />
      </label>

      <label>
        Language:
        <input type="text" name="language" value={itinerary.language} onChange={handleChange} />
      </label>

      <button type="submit">Update Itinerary</button>
    </form>
  );
};

export default EditTouristItinerary;
