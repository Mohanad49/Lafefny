/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homePage.css'; // Create this CSS file
import NotificationBell from './NotificationBell';

const TourGuideHome = () => {
  return (
    <div className="home">
      <div className="header">
        <h1>Welcome to the Tour Guide HomePage</h1>
        <div className="notification-container">
          <NotificationBell />
        </div>
      </div>

      <nav className="navigation">
        <section>
          <h2>Activity Management</h2>
          <div className="link-group">
          <Link to="/guestActivities">View Activities</Link>
          </div>
        </section>

        <section>
          <h2>Profile Management</h2>
          <div className="link-group">
            <Link to="/addTourGuideInfo">Add info</Link>
            <Link to="/editTourGuideInfo">Edit info</Link>
            <Link to="/changePassword">Change Password</Link>
            <Link to="/getTourGuideInfo">Get info</Link>
            <Link to="/editProfilePhoto">Edit Photo</Link>
            <Link to="/delete-account" className="delete-link">Delete Account</Link>
          </div>
        </section>

        <section>
          <h2>Itinerary Management</h2>
          <div className="link-group">
            <Link to="/itineraries">View Itineraries</Link>
            <Link to="/guide-tourist-Itineraries">View Tourist Itineraries</Link>
            <Link to="/add-itinerary">Add Itinerary</Link>
            <Link to="/add-tourist-itinerary">Add Tourist Itinerary</Link>
          </div>
        </section>
      </nav>
    </div>
  );
};

export default TourGuideHome;