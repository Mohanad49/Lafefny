/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const TourGuideHome = () => {
  return (
    <div>
      <h1>Welcome to the Tour Guide HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/activities">View Activities</Link>
        
        <h2>Itinerary Management</h2>
        <Link to="/itineraries">View Itineraries</Link> | {' '}
        <Link to="/add-itinerary">Add Itinerary</Link>

      </nav>
    </div>
  );
};

export default TourGuideHome;