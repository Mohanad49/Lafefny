/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import ChangePassword from './ChangePassword';

const SellerHome = () => {
  return (
    <div>
      <h1>Welcome to the Seller HomePage</h1>
      <nav>

        <h2>Management</h2>
        <Link to="/products">View Products</Link> | {' '}
        <Link to="/add-product">Add Product</Link> | {' '}
        <Link to="/sellerinfo">view info</Link> | {' '}
        <Link to="/addSellerInfo">add info</Link> | {' '}
        <Link to="/editSellerInfo">edit info</Link> | {' '}
        <Link to="/editSellerLogo">edit Logo</Link>
        
        <h2>Profile Management</h2>
        <Link to="/changepassword">Change Password</Link> | {' '}
        <Link to="/delete-account" className="delete-link">Delete Account</Link>
      </nav>
    </div>
  );
};

export default SellerHome;