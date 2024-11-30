/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import NotificationBell from './NotificationBell';
import Navbar from './Navbar';

const TouristHome = () => {
  return (
    <div>
      <Navbar />
      <div className="home">
        <div className="header">
          <h1>Welcome to the Tourist HomePage</h1>
          <div className="notification-container">
            <NotificationBell />
          </div>
        </div>
        <nav>
          <h2>Activity Management</h2>
          <Link to="/touristActivities">View Activities</Link> | {' '}
          <Link to="/tourist-Itineraries">View My Itineraries</Link> | {' '}
          <Link to="/touristAll-Itineraries">View All Itineraries</Link> | {' '}
          <Link to="/touristMuseums">View Historical Places/Museums</Link> | {' '}
          <Link to={`/touristHistory/${localStorage.getItem("userID")}`}>History</Link> | {' '}

          <h2>Profile Management</h2>
          <Link to="/viewTouristInfo">View Info</Link> | {' '}
          <Link to="/touristEditInfo">Edit Info</Link> | {' '}
          <Link to="/changePassword">Change Password</Link> | {' '}
          <Link to="/delete-account" className="delete-link">Delete Account</Link> | {' '}
          <Link to="/touristSelectPreferences">Select Preferences</Link> | {' '}
          <Link to="/complaints">Submit Complaint</Link> | {' '}
          <Link to="/my-complaints">View My Complaints</Link> | {' '}
          <Link to="/manage-addresses">Manage Addresses</Link>

          <h2>Product Management</h2>
          <Link to="/touristProducts">View Products</Link> | {' '}
          <Link to="/my-orders" className="dashboard-button">
            My Orders
          </Link>

          <h2>Bookings</h2>
          <Link to="/book-flights">Book Flights</Link> | {' '}
          <Link to="/book-hotels">Book Hotels</Link> | {' '}
          <Link to="/transportation-booking">Book Transportation</Link>
        </nav>
      </div>
    </div>
  );
};

export default TouristHome;
