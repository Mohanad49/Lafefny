/* eslint-disable no-unused-vars */
// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sign from './components/Sign';
import Home from './components/Home';
import AddActivity from './components/AddActivity';
import EditActivity from './components/EditActivity';
import ActivityList from './components/ActivityList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import ProductList from './components/ProductList';
import AdminHome from './components/AdminHome';
import AdvertiserHome from './components/AdvertiserHome';
import SellerHome from './components/SellerHome';
import TourGuideHome from './components/TourGuideHome';
import TouristHome from './components/TouristHome';
import './styles/styles.css'
const App = () => {

  return (
    <Router>
      <Routes>
          <>
            <Route path="/" element={<Sign />} />
            <Route path="/home" element={<Home />} />


            <Route path="/adminHome" element={<AdminHome />} />
            <Route path="/advertiserHome" element={<AdvertiserHome />} />
            <Route path="/sellerHome" element={<SellerHome />} />
            <Route path="/TourGuideHome" element={<TourGuideHome />} />
            <Route path="/TouristHome" element={<TouristHome />} />

            <Route path="/activities" element={<ActivityList />} />
            <Route path="/add-activity" element={<AddActivity />} />
            <Route path="/edit-activity/:id" element={<EditActivity />} />

            <Route path="/products" element={<ProductList />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/edit-product/:id" element={<EditProduct />} />
          </>
      </Routes>
    </Router>
  );
};

export default App;
