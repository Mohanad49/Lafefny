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
        <Link to="/activities">View Activities</Link> |{' '}
        <Link to="/add-activity">Add Activity</Link>

        <h2>Product Management</h2>
        <Link to="/products">View Products</Link> | {' '}
        <Link to="/add-product">Add Product</Link>
      </nav>
    </div>
  );
};

export default Home;
