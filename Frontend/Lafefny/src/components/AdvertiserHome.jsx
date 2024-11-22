/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import ChangePassword from './ChangePassword';

const AdvertiserHome = () => {
  return (
    <div>
      <h1>Welcome to the Advertiser HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/activities">View Activities</Link> | {' '}
        <Link to="/guest-itineraries">View Itineraries</Link> | {' '}
        <Link to="/guestMuseums">View Museums</Link> | {' '}
        <Link to="/add-activity">Add Activity</Link> | {' '}
        <Link to="/ActivityReport">View Activity Report</Link> | {' '}

        <h2>Profile Management</h2>
        <Link to="/addAdvertiserInfo">Add info</Link> | {' '}
        <Link to="/updateAdvertiserInfo">edit info</Link> | {' '}
        <Link to="/changepassword">Change Password</Link> | {' '}
        <Link to ="/getAdvertiserInfo">view info</Link> | {' '}
        <Link to ="/editAdvertiserPhoto">Edit logo</Link> | {' '}
        <Link to="/delete-account" className="delete-link">Delete Account</Link>

      </nav>
    </div>
  );
};

export default AdvertiserHome;