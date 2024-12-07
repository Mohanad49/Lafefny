import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, Clock, ShoppingBag, Box, Truck, Receipt } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      console.log('Fetched order details:', response.data);
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

  const formatOrderId = (orderId) => {
    return orderId.slice(-5).toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">Loading order details...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center text-red-500">{error}</div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">Order not found</div>
      </div>
    </div>
  );

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
              <Receipt className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold text-primary">Order Details</h1>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-6">
                  {/* Header with Order ID and Status */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="font-medium">Order #{formatOrderId(order._id)}</span>
                    </div>
                    <Badge className={getStatusColor(order.orderStatus) + " px-3 py-1 rounded-full"}>
                      {order.orderStatus}
                    </Badge>
                  </div>

                  {/* Order Information Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Ordered on {formatDate(order.orderDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Payment Method: {order.paymentMethod}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Shipping Address:</p>
                          <p>{order.shippingAddress?.street}</p>
                          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                          <p>{order.shippingAddress?.zipCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Products */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Box className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Products</span>
                      </div>
                      {order.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.productId?.imageUrl || 'https://via.placeholder.com/150'}
                              alt={product.productId?.name || 'Product'}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=Product+Image';
                              }}
                            />
                            <div>
                              <p className="font-medium">{product.productId?.name || 'Product'}</p>
                              <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">{'$' + product.price.toFixed(2)}</p>
                        </div>
                      ))}

                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total Amount</span>
                          <span className="text-lg text-primary">{'$' + order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Status */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Order Timeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Last Updated: {formatDate(order.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {order.orderStatus !== 'Cancelled' && (
                      <Button
                        onClick={handleCancelOrder}
                        variant="destructive"
                        className="w-full sm:w-auto"
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;