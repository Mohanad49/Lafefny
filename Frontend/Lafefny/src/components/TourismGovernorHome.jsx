/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import ChangePassword from './ChangePassword';
import Navbar from './Navbar';

const TourGuideHome = () => {
  return (
    <div>
      <Navbar />
      <h1>Welcome to the Tourism Governor HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/touristActivities">View Activities</Link>
        
        <h2>Itinerary Management</h2>
        <Link to="/guest-itineraries">View Itineraries</Link>

        <h2>Museum Management</h2>
        <Link to="/museums">View Historical Places/Museums</Link> | {' '}
        <Link to="/add-museum">Add Historical Places/Museums</Link> | {' '}
        <Link to="/add-museum-tag">Add Museum Tag</Link>

        <h2>Profile Management</h2>
        <Link to="/changepassword">Change Password</Link> 
        

      </nav>
    </div>
  );
};

export default TourGuideHome;