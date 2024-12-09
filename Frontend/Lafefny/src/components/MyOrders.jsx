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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

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
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.put(`http://localhost:8000/tourist/${userId}/orders/${orderId}/cancel`);
      
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: 'Cancelled' } : order
      ));
      
      toast({
        title: "Order Cancelled Successfully",
        description: `Amount refunded: ${response.data.refundAmount} EGP. New wallet balance: ${response.data.newWalletBalance} EGP`,
      });
  
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: error.response?.data?.error || 'Failed to cancel order'
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
                        <div className="flex flex-col sm:flex-row gap-2">
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