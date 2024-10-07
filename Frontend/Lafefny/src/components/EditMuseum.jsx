/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMuseumById, updateMuseum } from '../services/museumService';

const EditMuseum = () => {
  const { id } = useParams();
  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMuseum = async () => {
      try {
        setLoading(true);
        const response = await getMuseumById(id);
        console.log('Fetched museum data:', response); // For debugging
        setMuseum(response.data); // Set museum to response.data
        setLoading(false);
      } catch (err) {
        console.error('Error fetching museum:', err);
        setError('Failed to fetch museum data');
        setLoading(false);
      }
    };

    fetchMuseum();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ticketPrices.')) {
      const priceType = name.split('.')[1];
      setMuseum(prevState => ({
        ...prevState,
        ticketPrices: {
          ...prevState.ticketPrices,
          [priceType]: parseFloat(value)
        }
      }));
    } else if (name === 'tags') {
      const tagsArray = value.split(',').map(tag => tag.trim());
      setMuseum(prevState => ({
        ...prevState,
        tags: tagsArray
      }));
    } else {
      setMuseum(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handlePicturesChange = (e) => {
    const picturesArray = e.target.value.split(',').map(url => url.trim());
    setMuseum(prevState => ({
      ...prevState,
      pictures: picturesArray
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMuseum(id, museum);
      alert('Museum updated successfully');
      navigate('/museums');
    } catch (error) {
      console.error('Error updating Museum:', error);
      alert('Failed to update museum');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!museum) return null;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Museum</h2>
      <div>
        <label htmlFor="name">Museum Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={museum.name || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={museum.description || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="pictures">Pictures (comma-separated URLs):</label>
        <input
          type="text"
          id="pictures"
          name="pictures"
          value={museum.pictures ? museum.pictures.join(', ') : ''}
          onChange={handlePicturesChange}
        />
      </div>

      <div>
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={museum.location || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="openingHours">Opening Hours:</label>
        <input
          type="text"
          id="openingHours"
          name="openingHours"
          value={museum.openingHours || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="ticketPrices.foreigner">Ticket Price (Foreigner):</label>
        <input
          type="number"
          id="ticketPrices.foreigner"
          name="ticketPrices.foreigner"
          value={museum.ticketPrices?.foreigner || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="ticketPrices.native">Ticket Price (Native):</label>
        <input
          type="number"
          id="ticketPrices.native"
          name="ticketPrices.native"
          value={museum.ticketPrices?.native || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="ticketPrices.student">Ticket Price (Student):</label>
        <input
          type="number"
          id="ticketPrices.student"
          name="ticketPrices.student"
          value={museum.ticketPrices?.student || ''}
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
          value={museum.tags ? museum.tags.join(', ') : ''}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Update Museum</button>
    </form>
  );
};

export default EditMuseum;
