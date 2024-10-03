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
import './styles.css'
const App = () => {

  return (
    <Router>
      <Routes>
          <>
            <Route path="/" element={<Sign />} />
            <Route path="/home" element={<Home />} />

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
