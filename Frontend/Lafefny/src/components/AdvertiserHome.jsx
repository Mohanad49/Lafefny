/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const AdvertiserHome = () => {
  return (
    <div>
      <h1>Welcome to the Advertiser HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/activities">View Activities</Link> | {' '}
        <Link to="/guest-itineraries">View Itineraries</Link> | {' '}
        <Link to="/museums">View Museums</Link> | {' '}
        <Link to="/add-activity">Add Activity</Link>

      </nav>
    </div>
  );
};

export default AdvertiserHome;