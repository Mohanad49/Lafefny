import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/productList.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.get(`http://localhost:8000/tourist/${userId}/orders`);
      console.log('Fetched orders:', response.data); // Debug log
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.put(`http://localhost:8000/tourist/${userId}/orders/${orderId}/cancel`);
      
      // Update the orders list with the cancelled order
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: 'Cancelled' } : order
      ));
      
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list-container">
      <h1>My Orders</h1>
      <Link to="/touristHome" className="edit-button">Back to Home</Link>
      
      {orders.length === 0 ? (
        <p className="no-itineraries-message">No orders found</p>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Delivery Address</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order.orderID}</td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td>
                  <ul className="order-products-list">
                    {order.products.map((product, index) => (
                      <li key={index}>
                        {product.productId?.name || 'Product'} x {product.quantity} - ${product.price}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>
                  {order.selectedAddress.street}, {order.selectedAddress.city}<br/>
                  {order.selectedAddress.state}, {order.selectedAddress.country}<br/>
                  {order.selectedAddress.postalCode}
                </td>
                <td>{order.paymentMethod}</td>
                <td>
                  <span className={`status-${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => navigate(`/order-details/${order._id}`)}
                      className="edit-button"
                    >
                      View Details
                    </button>
                    {order.orderStatus === 'Processing' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            handleCancelOrder(order._id);
                          }
                        }}
                        className="delete-button"
                      >
                        Cancel Order
                      </button>
                    )}
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

export default MyOrders; 