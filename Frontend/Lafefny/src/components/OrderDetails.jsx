import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowLeft, MapPin, CreditCard, XCircle } from 'lucide-react';

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
      await fetchOrderDetails();
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Processing': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Shipped': 'bg-purple-100 text-purple-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-gray-600">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/my-orders')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </button>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Order Details</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{order.orderID}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(order.orderDate).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{product.productId?.name || 'Product'}</p>
                    <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(product.price * product.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">${product.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Total Amount</p>
                <p className="font-semibold text-xl">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Delivery Address</h2>
            </div>
            <div className="text-gray-600 space-y-1">
              <p>{order.selectedAddress.street}</p>
              <p>{order.selectedAddress.city}, {order.selectedAddress.state}</p>
              <p>{order.selectedAddress.country}, {order.selectedAddress.postalCode}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Payment Information</h2>
            </div>
            <p className="text-gray-600">{order.paymentMethod}</p>
          </div>
        </div>

        {order.orderStatus === 'Processing' && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCancelOrder}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;