/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { addMuseum } from '../services/museumService';
import { useNavigate } from 'react-router-dom';

const AddMuseum = () => {
  const navigate = useNavigate();
  const [museum, setMuseum] = useState({
    name: '',
    location: '',
    description: '',
    openingHours: '',
    ticketPrice: '',
  });

  const handleChange = (e) => {
    setMuseum({ ...museum, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMuseum(museum);
      alert('Museum added successfully');
      navigate('/museums');
    } catch (error) {
      console.error('Error adding museum:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-museum-form">
      <h2>Add New Museum</h2>
      <input
        type="text"
        name="name"
        placeholder="Museum Name"
        value={museum.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={museum.location}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={museum.description}
        onChange={handleChange}
      />
      <input
        type="text"
        name="openingHours"
        placeholder="Opening Hours"
        value={museum.openingHours}
        onChange={handleChange}
      />
      <input
        type="number"
        name="ticketPrice"
        placeholder="Ticket Price"
        value={museum.ticketPrice}
        onChange={handleChange}
      />
      <button type="submit">Add Museum</button>
    </form>
  );
};

export default AddMuseum;