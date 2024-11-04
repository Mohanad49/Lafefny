/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../services/productService';

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product data');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  console.log('Current state:', { loading, error, product });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleChange2=async(e)=>{
    const file= e.target.files[0];
    const base64 = await convertToBase64(file);
    setProduct({...product,imageUrl:base64})
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(id, product);
      alert('Product updated successfully');
      navigate('/products');
    } catch (error) {
      console.error('Error updating Product:', error);
      alert('Failed to update product');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>No product data available</div>;


  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Product</h2>
      <div>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={product.name || ''}
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
          value={product.price || ''}
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
          value={product.quantity || ''}
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
          onChange={(e)=>{handleChange2(e)}}
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={product.description || ''}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="seller">Seller:</label>
        <input
          type="text"
          id="seller"
          name="seller"
          value={product.seller || ''}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Update Product</button>
    </form>
  );
};

export default EditProduct;

function convertToBase64(file){
  return new Promise((resolve,reject)=>{
      const fileReader= new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload= ()=>{
          resolve(fileReader.result)
      }
      fileReader.onerror=(error)=>{
          reject(error)
      }
  })
}