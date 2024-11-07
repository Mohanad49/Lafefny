/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, updateProductArchiveStatus } from '../services/productService';
import '../styles/productList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);

  // Add this function at the top of your component, just after the useState declarations
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const openModal = (reviews) => {
    setSelectedReviews(reviews);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReviews([]);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => {
      if (filterType === 'price' && filterValue) {
        return product.price <= parseFloat(filterValue);
      }
      if (filterType === 'quantity' && filterValue) {
        return product.quantity >= parseInt(filterValue);
      }
      if (filterType === 'rating' && filterValue) {
        return product.ratings.averageRating >= parseFloat(filterValue);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.ratings.averageRating - a.ratings.averageRating;
      return 0;
    });

  const toggleArchiveStatus = async (id, currentStatus) => {
    try {
      await updateProductArchiveStatus(id);
      await fetchProducts(); // Refresh the list after toggling
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  };

  return (
    <div className="product-list-container">
      <h1>Product List</h1>
      <Link to="/add-product" className="add-product-button">Add New Product</Link>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name, description, or seller..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">Select Filter</option>
          <option value="price">Filter by Max Price</option>
          <option value="quantity">Filter by Min Quantity</option>
          <option value="rating">Filter by Min Rating</option>
        </select>
        {filterType && (
          <input
            type={filterType === 'quantity' ? 'number' : 'text'}
            placeholder={`Enter ${filterType} value`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="filter-input"
          />
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Average Rating</th>
            <th>Description</th>
            <th>Seller</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td><img src={product.imageUrl} alt={product.name} width="100" /></td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>{product.ratings.averageRating.toFixed(1)} ★ ({product.ratings.totalRatings})</td>
              <td>{product.description}</td>
              <td>{product.seller}</td>
              <td>
                <button onClick={() => openModal(product.ratings.reviews)}>View Reviews</button>
                <Link to={`/edit-product/${product._id}`} className="edit-button">Edit</Link>
                <button
                  className="edit-button"
                  onClick={() => toggleArchiveStatus(product._id, product.isArchived)}
                >
                  {product.isArchived ? 'Unarchive' : 'Archive'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Reviews</h2>
            {selectedReviews.length > 0 ? (
              <ul>
                {selectedReviews.map((review, index) => (
                  <li key={index}>
                    <strong>Reviewer:</strong> {review.reviewerName} <br />
                    <strong>Rating:</strong> {review.rating.toFixed(1)} ★ <br />
                    <strong>Comment:</strong> {review.comment} <br />
                    <strong>Date:</strong> {formatDate(review.date)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;