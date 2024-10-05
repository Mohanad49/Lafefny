/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';

const SellerHome = () => {
  return (
    <div>
      <h1>Welcome to the Seller HomePage</h1>
      <nav>

        <h2>Product Management</h2>
        <Link to="/products">View Products</Link> | {' '}
        <Link to="/add-product">Add Product</Link>

      </nav>
    </div>
  );
};

export default SellerHome;