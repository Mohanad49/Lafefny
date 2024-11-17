import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/productList.css';

const TouristWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userId = localStorage.getItem('userID');
        const response = await axios.get(`http://localhost:8000/tourist/${userId}/wishlist`);
        setWishlistItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError('Failed to load wishlist');
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.delete(`http://localhost:8000/tourist/${userId}/wishlist/${productId}`);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  const moveToCart = async (productId) => {
    try {
      const userId = localStorage.getItem('userID');
      
      // Add to cart first
      await axios.post(`http://localhost:8000/products/cart/${userId}`, {
        productId,
        quantity: 1
      });

      // Then remove from wishlist
      await removeFromWishlist(productId);
      
      alert('Item moved to cart successfully!');
    } catch (error) {
      console.error('Error moving item to cart:', error);
      alert('Failed to move item to cart');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list-container">
      <h1>My Wishlist</h1>
      <Link to="/touristProducts" className="edit-button">Back to Products</Link>
      
      {wishlistItems.length === 0 ? (
        <p className="no-itineraries-message">Your wishlist is empty</p>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Image</th>
              <th>Price</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wishlistItems.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td><img src={item.imageUrl} alt={item.name} width="100" /></td>
                <td>${item.price}</td>
                <td>{item.description}</td>
                <td>
                  <div className="button-group">
                    <button 
                      onClick={() => moveToCart(item._id)}
                      className="edit-button"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(item._id)}
                      className="delete-button"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TouristWishlist; 