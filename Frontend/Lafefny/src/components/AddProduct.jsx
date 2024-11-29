/* eslint-disable no-unused-vars */
// src/components/AddProduct.jsx
import React, { useState } from 'react';
import { addProduct } from '../services/productService';

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    imageUrl: '',
    description: '',
    seller: '',
    ownerID: localStorage.getItem('userID') // Get logged in user's ID
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleChange2 = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setProduct({...product, imageUrl: base64});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!product.ownerID) {
        alert('Please login first');
        return;
      }

      const response = await addProduct(product);
      console.log('Product added successfully:', response);
      alert('Product added successfully');
      
      // Reset form after successful submission
      setProduct({
        name: '',
        price: '',
        quantity: '',
        imageUrl: '',
        description: '',
        seller: '',
        ownerID: localStorage.getItem('userID') // Maintain ownerID after reset
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Product</h2>
      <div>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={product.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={product.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="quantity">Available Quantity:</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={product.quantity}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="imageUrl">Picture URL:</label>
        <input
          type="file"
          id="imageUrl"
          name="imageUrl"
          accept=".png .jpeg .jpg"
          onChange={(e) => handleChange2(e)}
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={product.description}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="seller">Seller:</label>
        <input
          type="text"
          id="seller"
          name="seller"
          value={product.seller}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Add Product</button>
    </form>
  );
};

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

export default AddProduct;
