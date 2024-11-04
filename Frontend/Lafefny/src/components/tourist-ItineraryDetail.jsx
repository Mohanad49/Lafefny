/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTouristItineraryById } from '../services/touristItineraryService'; // Service function to fetch tourist itinerary by ID
import '../styles/itineraryList.css'; // Import the itinerary styles

const TouristItineraryDetail = () => {
  const { id } = useParams(); // Get the itinerary ID from the URL
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await getTouristItineraryById(id); // Fetch itinerary by ID
        setItinerary(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch itinerary details');
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  if (loading) return <p>Loading itinerary details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="itinerary-card">
      <h1 className="activity-item-title">{itinerary.name}</h1>
      <div className="itinerary-item">
        <p className="yellow-text">Activities: {itinerary.activities.length ? itinerary.activities.join(', ') : 'No activities available'}</p>
        <p className="yellow-text">Locations: {itinerary.locations.length ? itinerary.locations.join(', ') : 'No locations available'}</p>
        <p className="yellow-text">Start Date: {new Date(itinerary.startDate).toLocaleDateString()}</p>
        <p className="yellow-text">End Date: {new Date(itinerary.endDate).toLocaleDateString()}</p>
        <p className="yellow-text">Total Price: {itinerary.price} EGP</p>
        <p className="yellow-text">Language: {itinerary.language}</p>
        <p className="yellow-text">Tour Guide Name: {itinerary.tourGuideName || 'Not assigned'}</p>
        <p className="yellow-text">Tags: {itinerary.tags.length ? itinerary.tags.join(', ') : 'No tags available'}</p>
        <p className="yellow-text">Rating: {itinerary.ratings?.averageRating || 'Not rated'}</p>
      </div>
    </div>
  );
};

export default TouristItineraryDetail;
