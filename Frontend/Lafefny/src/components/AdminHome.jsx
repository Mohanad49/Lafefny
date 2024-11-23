/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import NotificationBell from './NotificationBell';

const AdminHome = () => {
  return (
    <div className="home">
      <div className="header">
        <h1>Welcome to the Admin HomePage</h1>
        <div className="notification-container">
          <NotificationBell />
        </div>
      </div>
      <nav className="navigation">
        <h2>User Management</h2>
        <Link to="/users">View All Users</Link> |{' '}
        <Link to="/add-tourism-Governor">Add Tourism Governor</Link> | {' '}
        <Link to="/changePassword">Change Password</Link> | {' '}
        <Link to="/add-admin">Add Admin</Link>
        <Link to="/changepassword">Change Password</Link> | {' '}
        <Link to="/add-admin">Add Admin</Link> | {' '}
        <Link to="/numberOfUsers">Number of Users</Link> | {' '}

        <h2>Activity Management</h2>
        <Link to="/admin-activities">View Activities</Link> |{' '}
        <Link to="/admin-itineraries">View All Itineraries</Link> |{' '}
        <Link to="/activityCategories">View Activities Categories</Link> |{' '}
        <Link to="/preferenceTags">View Preference Tags</Link> | {' '}
        <Link to="/add-activityCategory">Add Activity Category</Link> | {' '}
        <Link to="/add-preferenceTag">Add Preference Tag</Link>

        <h2>Product Management</h2>
        <Link to="/products">View Products</Link> | {' '}
        <Link to="/add-product">Add Product</Link>

        <h2>Complaints Management</h2>
        <Link to="/admin/complaints">View Complaints</Link>
        
      </nav>
    </div>
  );
};

export default AdminHome;