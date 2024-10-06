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
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Product</h2>
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
          type="url"
          id="imageUrl"
          name="imageUrl"
          value={product.imageUrl}
          onChange={handleChange}
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
        <label htmlFor="seller">Seller Name:</label>
        <input
          type="text"
          id="seller"
          name="seller"
          value={product.seller}
          onChange={handleChange}
          required
          placeholder="Enter seller's name"
        />
      </div>

      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProduct;
