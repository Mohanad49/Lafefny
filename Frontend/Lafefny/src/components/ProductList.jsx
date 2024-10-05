/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { Link } from 'react-router-dom'
import { fetchProducts as getProductsFromService } from '../services/productService';
import '../styles/productList.css'

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await getProducts();
        setProducts(productData);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
        try {
            const data = await getProductsFromService(searchTerm, minPrice, maxPrice, sortBy);
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    loadProducts();
}, [searchTerm, minPrice, maxPrice, sortBy]);

const openModal = (reviews) => {
  setSelectedReviews(reviews);
  setShowModal(true);
};

const closeModal = () => {
  setShowModal(false);
  setSelectedReviews([]);
};

return (
  <div>
      <h1>Product List</h1>

      <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div>
          <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
          />
      </div>

      <select onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort by...</option>
          <option value="rating">Rating</option>
      </select>

      <table>
          <thead>
              <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Average Rating</th>
                  <th>Description</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              {products.length > 0 ? (
                  products.map(product => (
                      <tr key={product._id}>
                          <td>{product.name}</td>
                          <td><img src={product.imageUrl} alt={product.name} width="100" /></td>
                          <td>${(product.price || 0).toFixed(2)}</td>
                          <td>{(product.ratings.averageRating || 0).toFixed(1)} ★</td>
                          <td>{product.description}</td>
                          <td>
                              <button onClick={() => openModal(product.ratings.reviews)}>View Reviews</button>
                              <Link to={`/edit-product/${product._id}`}>
                              <button type="button" className="edit-button">
                                Edit Product
                              </button>
                              </Link>

                          </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="6" className="no-products">No products found</td>
                  </tr>
              )}
          </tbody>
      </table>

      {/* Modal for Reviews */}
      {showModal && (
          <div className="modal">
              <div className="modal-content">
                  <span className="close" onClick={closeModal}>&times;</span>
                  <h2>Reviews</h2>
                  {selectedReviews.length > 0 ? (
                      <ul>
                          {selectedReviews.map((review, index) => (
                              <li key={index}>
                                  <strong>User:</strong> {review.user} <br />
                                  <strong>Rating:</strong> {review.rating.toFixed(1)} ★ <br />
                                  <strong>Comment:</strong> {review.comment}
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