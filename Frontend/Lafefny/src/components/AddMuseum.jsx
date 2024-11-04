/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { addMuseum } from '../services/museumService';
import { useNavigate } from 'react-router-dom';

const AddMuseum = () => {
  const navigate = useNavigate();
  const [museum, setMuseum] = useState({
    name: '',
    description: '',
    pictures: [],
    location: '',
    openingHours: '',
    ticketPrices: {
      foreigner: '',
      native: '',
      student: ''
    },
    tags: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ticketPrices.')) {
      const priceType = name.split('.')[1];
      setMuseum(prev => ({
        ...prev,
        ticketPrices: {
          ...prev.ticketPrices,
          [priceType]: value
        }
      }));
    } else {
      setMuseum(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePicturesChange = (e) => {
    const pictures = e.target.value.split(',').map(url => url.trim());
    setMuseum(prev => ({ ...prev, pictures }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setMuseum(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const museumData = {
        ...museum,
        ticketPrices: {
          foreigner: Number(museum.ticketPrices.foreigner),
          native: Number(museum.ticketPrices.native),
          student: Number(museum.ticketPrices.student)
        }
      };
      await addMuseum(museumData);
      alert('Museum added successfully');
      navigate('/museums');
    } catch (error) {
      console.error('Error adding museum:', error);
      alert('Error adding museum: ' + error.message);
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
      <textarea
        name="description"
        placeholder="Description"
        value={museum.description}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="pictures"
        placeholder="Picture URLs (comma-separated)"
        value={museum.pictures.join(', ')}
        onChange={handlePicturesChange}
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        value={museum.location}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="openingHours"
        placeholder="Opening Hours"
        value={museum.openingHours}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="ticketPrices.foreigner"
        placeholder="Ticket Price (Foreigner)"
        value={museum.ticketPrices.foreigner}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="ticketPrices.native"
        placeholder="Ticket Price (Native)"
        value={museum.ticketPrices.native}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="ticketPrices.student"
        placeholder="Ticket Price (Student)"
        value={museum.ticketPrices.student}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="tags"
        placeholder="Tags (comma-separated)"
        value={museum.tags.join(', ')}
        onChange={handleTagsChange}
        required
      />
      <button type="submit">Add Museum</button>
    </form>
  );
};

export default AddMuseum;