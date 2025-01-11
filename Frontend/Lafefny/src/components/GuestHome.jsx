/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homePage.css';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/guestActivities">View Activities</Link> | {' '}
        <Link to="/guest-Itineraries">View Itineraries</Link> | {' '}
        <Link to="/guestMuseums">View Historical Places/Museums</Link>

      </nav>
    </div>
  );
};

export default Home;
