/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const TourGuideHome = () => {
  return (
    <div>
      <h1>Welcome to the Tourism Governor HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/touristActivities">View Activities</Link>
        
        <h2>Itinerary Management</h2>
        <Link to="/guest-itineraries">View Itineraries</Link>

        <h2>Museum Management</h2>
        <Link to="/museums">View Historical Places/Museums</Link> | {' '}
        <Link to="/add-museum">Add Historical Places/Museums</Link> | {' '}
        <Link to="/create-tag">Create Tag</Link>

        

      </nav>
    </div>
  );
};

export default TourGuideHome;