/* eslint-disable no-unused-vars */
// src/components/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts, editProduct } from '../services/productService';

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    imageUrl: '',
    description: '',
    seller: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then((response) => {
      const foundProduct = response.data.find((product) => product._id === id);
      setProduct(foundProduct);
    });
  }, [id]);

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editProduct(id, product)
      .then(() => {
        alert('Product updated successfully');
        navigate('/products'); // Redirect to the product list after editing
      })
      .catch((error) => console.error('Error updating Product:', error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Product</h2>
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
        <label htmlFor="seller">Seller:</label>
        <input
          type="text"
          id="seller"
          name="seller"
          value={product.seller}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Update Product</button>
      
    </form>
  );
};

export default EditProduct;
