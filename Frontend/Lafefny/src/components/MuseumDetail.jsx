/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMuseumById } from '../services/museumService'; // Service function to fetch museum by ID
import '../styles/museumList.css'; // Import the museum styles

const MuseumDetail = () => {
  const { id } = useParams(); // Get the museum ID from the URL
  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMuseum = async () => {
      try {
        const response = await getMuseumById(id); // Fetch museum by ID
        setMuseum(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch museum details');
        setLoading(false);
      }
    };

    fetchMuseum();
  }, [id]);

  if (loading) return <p>Loading museum details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="museum-list-container">
      <h1>{museum.name}</h1>
      <div className="museum-item">
        <p>Description: {museum.description}</p>
        <p>Location: {museum.location}</p>
        <p>Opening Hours: {museum.openingHours}</p>
        <p>Ticket Prices:</p>
        <ul>
          <li>Foreigner: {museum.ticketPrices.foreigner} EGP</li>
          <li>Native: {museum.ticketPrices.native} EGP</li>
          <li>Student: {museum.ticketPrices.student} EGP</li>
        </ul>
        <p>Tags: {museum.tags.length ? museum.tags.join(', ') : 'No tags available'}</p>
        <p>Rating: {museum.rating || 'Not rated'}</p>
      </div>
    </div>
  );
};

export default MuseumDetail; 