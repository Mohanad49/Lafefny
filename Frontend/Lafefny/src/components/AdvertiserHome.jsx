/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import '../styles/homePage.css';
import Navbar from './Navbar';

const AdvertiserHome = () => {
  return (
    <div className="home">
      <Navbar />
      <div className="header">
        <h1>Welcome to the Advertiser HomePage</h1>
        <div className="notification-container">
          <NotificationBell />
        </div>
      </div>

      <nav className="navigation">
        <section>
          <h2>Activity Management</h2>
          <div className="link-group">
            <Link to="/activities">View Activities</Link>
            <Link to="/guest-itineraries">View Itineraries</Link>
            <Link to="/guestMuseums">View Museums</Link>
            <Link to="/add-activity">Add Activity</Link>
            <Link to="/ActivityReport">View Activity Report</Link> | {' '}
          </div>
        </section>

        <section>
          <h2>Profile Management</h2>
          <div className="link-group">
            <Link to="/editAdvertiserInfo">View info</Link>
            <Link to="/changePassword">Change Password</Link>
            <Link to="/delete-account" className="delete-link">Delete Account</Link>
          </div>
        </section>
      </nav>
    </div>
  );
};

export default AdvertiserHome;