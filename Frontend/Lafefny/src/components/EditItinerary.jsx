/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItinerary, editItinerary } from '../services/itineraryService';

const EditItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    activities: []
  });

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await getItinerary(id);
        setItinerary(response.data);
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      }
    };
    fetchItinerary();
  }, [id]);

  const handleChange = (e) => {
    setItinerary({ ...itinerary, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await editItinerary(id, itinerary);
      alert('Itinerary updated successfully');
      navigate('/itineraries');
    } catch (error) {
      console.error('Error updating itinerary:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-itinerary-form">
      <h2>Edit Itinerary</h2>
      <input
        type="text"
        name="name"
        value={itinerary.name}
        onChange={handleChange}
        placeholder="Itinerary Name"
        required
      />
      <input
        type="date"
        name="startDate"
        value={itinerary.startDate}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="endDate"
        value={itinerary.endDate}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        value={itinerary.description}
        onChange={handleChange}
        placeholder="Description"
      />
      <button type="submit">Update Itinerary</button>
    </form>
  );
};

export default EditItinerary;