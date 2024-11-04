/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const AdminHome = () => {
  return (
    <div>
      <h1>Welcome to the Admin HomePage</h1>
      <nav>

        <h2>User Management</h2>
        <Link to="/users">View All Users</Link> |{' '}
        <Link to="/add-tourism-Governor">Add Tourism Governor</Link> | {' '}
        <Link to="/add-admin">Add Admin</Link>

        <h2>Activity Management</h2>
        <Link to="/activities">View Activities</Link> |{' '}
        <Link to="/activityCategories">View Activities Categories</Link> |{' '}
        <Link to="/preferenceTags">View Preference Tags</Link> | {' '}
        <Link to="/add-activityCategory">Add Activity Category</Link> | {' '}
        <Link to="/add-preferenceTag">Add Preference Tag</Link>

        <h2>Product Management</h2>
        <Link to="/products">View Products</Link> | {' '}
        <Link to="/add-product">Add Product</Link>
      </nav>
    </div>
  );
};

export default AdminHome;