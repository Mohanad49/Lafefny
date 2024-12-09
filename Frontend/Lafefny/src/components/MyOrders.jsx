import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// Update this import to match your project structure
import Navigation from "../components/Navigation";
import { Package, Clock } from "lucide-react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const { currency } = useCurrency();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.get(`http://localhost:8000/tourist/${userId}/wallet`);
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive"
      });
    }
  };

  const convertPrice = (price) => {
    if (!price) return 0;
    const numericPrice = typeof price === 'string' ? 
      parseFloat(price.replace(/[^0-9.-]+/g, "")) : 
      parseFloat(price);
    const convertedPrice = numericPrice * currencies[currency].rate;
    return convertedPrice;
  };

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.get(`http://localhost:8000/tourist/${userId}/orders`);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.put(`http://localhost:8000/tourist/${userId}/orders/${orderId}/cancel`);
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: 'Cancelled' } : order
      ));
      
      // Update wallet balance after cancellation
      setWalletBalance(response.data.walletBalance);
      
      toast({
        title: "Order Cancelled",
        description: `Order cancelled successfully. Updated wallet balance: ${currencies[currency].symbol}${convertPrice(response.data.walletBalance).toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || 'Failed to cancel order',
        variant: "destructive"
      });
    }
  };

  const formatOrderId = (orderId) => {
    return `#${orderId.slice(-6).toUpperCase()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'text-blue-500';
      case 'Shipped':
        return 'text-green-500';
      case 'Delivered':
        return 'text-green-700';
      case 'Cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Package className="h-8 w-8" />
            My Orders
          </h1>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-semibold text-primary">My Orders</h1>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  Wallet Balance: {currencies[currency].symbol}{convertPrice(walletBalance).toFixed(2)}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div>
                          <p className="font-semibold mb-2">
                            Order {formatOrderId(order._id)}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Placed on {format(new Date(order.createdAt), 'MMM d, yyyy')}
                          </p>
                          <p className={`text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </p>
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
                                  <span className="float-right">${convertPrice(product.price).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium flex justify-between">
                                Total Amount:
                                <span className="text-primary">${convertPrice(order.totalAmount).toFixed(2)}</span>
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
                            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive"
                                  onClick={() => setSelectedOrderId(order._id)}
                                >
                                  Cancel Order
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this order? The amount will be refunded to your wallet.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No, keep order</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleCancelOrder(selectedOrderId)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Yes, cancel order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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