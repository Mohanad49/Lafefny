/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import NotificationBell from './NotificationBell';

const SellerHome = () => {
  return (
    <div className="home">
      <div className="header">
        <h1>Welcome to the Seller HomePage</h1>
        <div className="notification-container">
          <NotificationBell />
        </div>
      </div>

      <nav className="navigation">
        <section>
        <h2>Management</h2>
        <div className="link-group">
        <Link to="/products">View Products</Link> | {' '}
        <Link to="/add-product">Add Product</Link> | {' '}
        <Link to="/sellerInfo">view info</Link> | {' '}
        <Link to="/addSellerInfo">add info</Link> | {' '}
        <Link to="/editSellerInfo">edit info</Link> | {' '}
        <Link to="/editSellerLogo">edit Logo</Link>
        </div>
        </section>
       
        <section>
        <h2>Profile Management</h2>
        <div className="link-group">
        <Link to="/changePassword">Change Password</Link> | {' '}
        <Link to="/delete-account" className="delete-link">Delete Account</Link>
        </div>
        </section>
      </nav>
    </div>
  );
};

export default SellerHome;