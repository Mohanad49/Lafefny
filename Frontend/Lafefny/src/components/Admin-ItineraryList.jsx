import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItineraries, updateItineraryInappropriateFlag } from '../services/itineraryService';
import '../styles/ItineraryList.css';

const AdminItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await getItineraries();
      setItineraries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setItineraries([]);
    }
  };

  const toggleInappropriateFlag = async (id, currentFlag) => {
    try {
      await updateItineraryInappropriateFlag(id, !currentFlag);
      fetchItineraries();
    } catch (error) {
      console.error('Error toggling inappropriate flag:', error);
    }
  };

  return (
    <div className="itinerary-list-container">
      <h2>Admin Itinerary List</h2>
      <ul className="itinerary-list">
        {itineraries.map((itinerary) => (
          <li key={itinerary._id} className="itinerary-item">
            <div className="itinerary-card">
              <h3>{itinerary.name}</h3>
              <p>Language: {itinerary.language}</p>
              <p>Price: ${itinerary.price}</p>
              <div className="itinerary-actions">
                <button
                  className="toggle-inappropriate-button"
                  onClick={() => toggleInappropriateFlag(itinerary._id, itinerary.inappropriateFlag)}
                >
                  {itinerary.inappropriateFlag ? 'Appropriate' : 'Inappropriate'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminItineraryList; 