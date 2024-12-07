import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, Clock, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      console.log('Fetched orders:', response.data);
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
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: 'Cancelled' } : order
      ));
      
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const formatOrderId = (orderId) => {
    return orderId.slice(-5).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold text-primary">My Orders</h1>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No orders found</div>
            ) : (
              <div className="grid gap-6">
                {orders.map(order => (
                  <Card key={order._id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        {/* Header with Order ID and Status */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-gray-500">Order</p>
                              <p className="font-semibold">#{formatOrderId(order._id)}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>

                        {/* Order Details */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Ordered on {new Date(order.orderDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>{order.paymentMethod}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{order.selectedAddress.street}, {order.selectedAddress.city}, {order.selectedAddress.postalCode}</span>
                            </div>
                          </div>

                          {/* Products List */}
                          <div className="space-y-2">
                            <p className="font-medium">Products:</p>
                            <ul className="space-y-1">
                              {order.products.map((product, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                  {product.productId?.name || 'Product'} × {product.quantity}
                                  <span className="float-right">${product.price.toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium flex justify-between">
                                Total Amount:
                                <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button
                            onClick={() => navigate(`/order-details/${order._id}`)}
                            variant="outline"
                            className="text-primary"
                          >
                            View Details
                          </Button>
                          {order.orderStatus === 'Processing' && (
                            <Button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  handleCancelOrder(order._id);
                                }
                              }}
                              variant="destructive"
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;