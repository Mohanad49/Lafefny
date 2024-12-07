import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/checkout.css';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.get(`http://localhost:8000/tourist/${userId}/orders/${orderId}`);
      console.log('Fetched order details:', response.data); // Debug log
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      if (!window.confirm('Are you sure you want to cancel this order?')) {
        return;
      }

      const userId = localStorage.getItem('userID');
      await axios.put(`http://localhost:8000/tourist/${userId}/orders/${orderId}/cancel`);
      
      // Refresh order details
      await fetchOrderDetails();
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="checkout-container">
      <div className="order-header">
        <h1>Order Details</h1>
        <div className="order-meta">
          <p><strong>Order ID:</strong> {order.orderID}</p>
          <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
          <p className={`status-${order.orderStatus.toLowerCase()}`}>
            <strong>Status:</strong> {order.orderStatus}
          </p>
        </div>
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <table className="checkout-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((product, index) => (
              <tr key={index}>
                <td>{product.productId?.name || 'Product'}</td>
                <td>{product.quantity}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>${(product.price * product.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3"><strong>Total Amount</strong></td>
              <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="delivery-section">
        <h2>Delivery Address</h2>
        <div className="address-card selected">
          <p>{order.selectedAddress.street}</p>
          <p>{order.selectedAddress.city}, {order.selectedAddress.state}</p>
          <p>{order.selectedAddress.country}, {order.selectedAddress.postalCode}</p>
        </div>
      </div>

      <div className="payment-section">
        <h2>Payment Information</h2>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      </div>

      <div className="order-actions">
        <button 
          onClick={() => navigate('/my-orders')}
          className="back-button"
        >
          Back to Orders
        </button>
        {order.orderStatus === 'Processing' && (
          <button 
            onClick={handleCancelOrder}
            className="cancel-button"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails; 