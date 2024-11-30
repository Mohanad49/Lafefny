import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/productList.css';

const TouristCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem('userID');
        const response = await axios.get(`http://localhost:8000/tourist/${userId}/cart`);
        setCartItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load cart');
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.put(`http://localhost:8000/tourist/${userId}/cart/${productId}`, {
        quantity: newQuantity
      });
      setCartItems(prev => prev.map(item => 
        item._id === productId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.delete(`http://localhost:8000/tourist/${userId}/cart/${productId}`);
      setCartItems(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="product-list-container">
      <h1>My Cart</h1>
      <Link to="/touristProducts" className="edit-button">Back to Products</Link>
      
      {cartItems.length === 0 ? (
        <p className="no-itineraries-message">Your cart is empty</p>
      ) : (
        <>
          <table className="product-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td><img src={item.imageUrl} alt={item.name} width="100" /></td>
                  <td>${item.price}</td>
                  <td>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        className="edit-button"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="edit-button"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>{item.description}</td>
                  <td>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="delete-button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-summary" style={{ marginTop: '20px', textAlign: 'right' }}>
            <h3>Total: ${total.toFixed(2)}</h3>
            <button 
              className="edit-button"
              onClick={() => navigate('/checkout')}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TouristCart; 