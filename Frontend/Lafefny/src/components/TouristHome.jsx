/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const TouristHome = () => {
  return (
    <div>
      <h1>Welcome to the Tourist HomePage</h1>
      <nav>
        <h2>Activity Management</h2>
        <Link to="/activities">View Activities</Link>

        <h2>Product Management</h2>
        <Link to="/products">View Products</Link>
      </nav>
    </div>
  );
};

export default TouristHome;
