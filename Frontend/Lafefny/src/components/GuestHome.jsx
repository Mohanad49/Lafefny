/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/touristActivities">View Activities</Link> | {' '}
        <Link to="/guest-Itineraries">View Itineraries</Link> | {' '}
        <Link to="/touristMuseums">View Historical Places/Museums</Link>

      </nav>
    </div>
  );
};

export default Home;
