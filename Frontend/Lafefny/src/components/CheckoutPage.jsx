import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import '../styles/checkout.css';
import { ShoppingCart, CreditCard, MapPin, ArrowLeft, Plus, Check, Trash2, Wallet }  from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useCurrency, currencies } from '../context/CurrencyContext';
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useToast } from "@/components/ui/use-toast";
const stripePromise = loadStripe('pk_test_51QP7WoG4UGkAwtrqHrV9BgIvG1T8ZNjqOpbKq9W8kD4xwUcmNCegaX0jOnKzU1JNckplg9MIomiIhdGEt3e1FFHn007MSX3aFl');

const StripePaymentForm = ({ onPaymentSuccess, total, currencySymbol, selectedAddress }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const userId = localStorage.getItem('userID');
      console.log('Creating payment intent for amount:', total);
      
      // Create payment intent
      const { data } = await axios.post(
        `http://localhost:8000/tourist/${userId}/create-payment-intent`,
        {
          amount: Math.round(total * 100), // Convert to cents
          currency: 'usd'
        }
      );

      console.log('Payment intent created:', data);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              address: {
                city: selectedAddress.city,
                country: selectedAddress.country,
                line1: selectedAddress.street,
                postal_code: selectedAddress.postalCode,
                state: selectedAddress.state
              }
            }
          }
        }
      );

      if (stripeError) {
        console.error('Payment error:', stripeError);
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment successful:', paymentIntent);
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="stripe-card-element">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && <div className="stripe-error">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="stripe-submit-button"
      >
        {processing ? 'Processing...' : `Pay ${currencySymbol}${total.toFixed(2)}`}
      </button>
    </form>
  );
};

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const { toast } = useToast();
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false
  });
  const navigate = useNavigate();

  const { currency } = useCurrency();
    
  const convertPrice = (priceInEGP) => {
    if (!priceInEGP) return 0;
    const price = typeof priceInEGP === 'string' ? parseFloat(priceInEGP) : priceInEGP;
    return Math.round(price * currencies[currency].rate);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userID');
        if (!userId) {
          throw new Error('User not logged in');
        }
        
        // Fetch cart items
        const cartResponse = await axios.get(`http://localhost:8000/tourist/${userId}/cart`);
        setCartItems(cartResponse.data);

        // Fetch addresses
        const addressResponse = await axios.get(`http://localhost:8000/tourist/${userId}/addresses`);
        const addressData = addressResponse.data;
        setAddresses(addressData);
        
        // Set default address if available
        const defaultAddress = addressData.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(addressData.indexOf(defaultAddress));
        } else if (addressData.length > 0) {
          setSelectedAddress(0); // Select first address by default
        }

        // Fetch wallet balance
        const walletResponse = await axios.get(`http://localhost:8000/tourist/getTouristInfo/${userId}`);
        if (walletResponse.data && walletResponse.data.length > 0) {
          setWalletBalance(walletResponse.data[0].wallet || 0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load checkout data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'Credit Card') {
      setShowStripePayment(true);
    } else {
      setShowStripePayment(false);
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance < total) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Your wallet balance is not enough for this purchase."
      });
      return;
    }

    try {
      setProcessing(true);
      const userId = localStorage.getItem('userID');
      

      const deductResponse = await axios.post(`http://localhost:8000/tourist/${userId}/wallet/deduct`, {
        amount: total
      });
  
      if (!deductResponse.data.success) {
        throw new Error(deductResponse.data.error || 'Failed to process wallet payment');
      }
      // Create order with wallet payment
      const orderResponse = await axios.post(
        `http://localhost:8000/tourist/${userId}/orders`,
        {
          products: cartItems.map(item => ({
            productId: item._id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: total,
          paymentMethod: 'Wallet',
          selectedAddress: addresses[selectedAddress]
        }
      );
      // Deduct from wallet
      // await axios.post(`http://localhost:8000/tourist/${userId}/wallet/deduct`, {
      //   amount: total
      // });

      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed and payment processed."
      });
      navigate('/touristHome');
    } catch (error) {
      console.error('Wallet payment error:', error);
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: error.response?.data?.error || 'Failed to process wallet payment'
    });
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedAddress === null || selectedAddress < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a delivery address."
      });
      return;
    }

    if (!addresses[selectedAddress]) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected address is invalid."
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your cart is empty."
      });
      return;
    }

    setProcessing(true);
    try {
      switch (paymentMethod) {
        case 'Wallet':
          await handleWalletPayment();
          break;
        case 'Cash on Delivery':
          await handleCashOrder();
          break;
        case 'Credit Card':
          setShowStripePayment(true);
          break;
        default:
          throw new Error('Invalid payment method');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      if (!newAddress.street || !newAddress.city || !newAddress.state || 
          !newAddress.country || !newAddress.postalCode) {
          toast({
              variant: "destructive",
              title: "Error",
              description: "Please fill in all fields"
          });
        
        return;
      }

      const userId = localStorage.getItem('userID');
      if (!userId) {
        throw new Error('User not logged in');
      }

      setProcessing(true);
      const response = await axios.post(
        `http://localhost:8000/tourist/${userId}/addresses`,
        newAddress
      );

      // Update addresses list and select the new address if it's default or there's no selected address
      const updatedAddresses = response.data;
      setAddresses(updatedAddresses);
      
      const addedAddress = updatedAddresses[updatedAddresses.length - 1];
      if (newAddress.isDefault || selectedAddress === 0) {
        setSelectedAddress(updatedAddresses.indexOf(addedAddress));
      }

      // Reset form and close modal
      setNewAddress({
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        isDefault: false
      });
      setShowAddModal(false);
      
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message ||"Failed to add address"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCashOrder = async () => {
    try {
      const userId = localStorage.getItem('userID');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const orderData = {
        products: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod: 'Cash on Delivery',
        selectedAddress: addresses[selectedAddress]
      };

      await axios.post(`http://localhost:8000/tourist/${userId}/orders`, orderData);
      toast({
        title: "Success",
        description: "Order placed successfully!"
      });
      navigate('/touristHome');
    } catch (error) {
      console.error('Cash order error:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const userId = localStorage.getItem('userID');
      if (!userId) {
        throw new Error('User not logged in');
      }

      // Validate cart items and address
      if (!cartItems.length) {
        throw new Error('Cart is empty');
      }
      if (selectedAddress === null || !addresses[selectedAddress]) {
        throw new Error('Invalid delivery address');
      }

      const orderData = {
        products: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod: 'Credit Card',
        selectedAddress: addresses[selectedAddress]
      };

      // Log the order data before sending
      console.log('Creating order with data:', orderData);

      const response = await axios.post(
        `http://localhost:8000/tourist/${userId}/orders`, 
        orderData
      );

      if (response.data && response.data.order) {
        console.log('Order created successfully:', response.data);
        toast({
          title: "Success",
          description: "Order placed successfully!"
        });
        navigate('/touristHome');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      let errorMessage = 'Failed to create order. ';
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please contact support.';
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    }
  };

   return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-accent/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart Items ({cartItems.length})
                  </h2>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Your cart is empty
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg">
                          <img 
                            src={item.imageUrl || item.image} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="text-primary font-medium">{currencies[currency].symbol}{convertPrice(item.price * item.quantity).toFixed(2)}</p>
                          </div> 
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Address Section */}
                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </h2>
                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No addresses found
                      </div>
                    ) : (
                      addresses.map((address, index) => (
                        <div 
                          key={index}
                          onClick={() => setSelectedAddress(index)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            selectedAddress === index 
                              ? 'bg-primary/10 ring-2 ring-primary shadow-sm' 
                              : 'bg-background border border-border hover:border-primary/50'
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedAddress(index);
                            }
                          }}
                          aria-selected={selectedAddress === index}
                        >
                          <div className="flex items-start">
                            <div>
                              <p className="font-medium">{address.street}</p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-sm text-muted-foreground">{address.country}</p>
                              {address.isDefault && (
                                <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  Default Address
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      onClick={() => setShowAddModal(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                </div>

                {/* Payment Method Section */}
                <div className="bg-card rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </h2>
                  <div className="space-y-4">
                    {['Cash on Delivery', 'Credit Card', 'Wallet'].map((method) => (
                      <div 
                        key={method}
                        onClick={() => handlePaymentMethodChange(method)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          paymentMethod === method
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {method === 'Cash on Delivery' && <MapPin className="h-5 w-5" />}
                            {method === 'Credit Card' && <CreditCard className="h-5 w-5" />}
                            {method === 'Wallet' && <Wallet className="h-5 w-5" />}
                            <span>{method}</span>
                          </div>
                          {paymentMethod === method && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        {method === 'Wallet' && (
                          <div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Balance: {currencies[currency].symbol}{convertPrice(walletBalance).toFixed(2)}
                            </p>
                            {walletBalance < (total + (paymentMethod === 'Cash on Delivery' ? 40 : 0)) && (
                              <p className="text-sm text-destructive mt-1">
                                Insufficient balance
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                    <span>{currencies[currency].symbol}{convertPrice(total).toFixed(2)}</span>
                      <span>{currencies[currency].symbol}{convertPrice(total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>{currencies[currency].symbol}{paymentMethod === 'Cash on Delivery' ? convertPrice(40).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span className="text-primary">
                          {currencies[currency].symbol}
                          {(convertPrice(total + (paymentMethod === 'Cash on Delivery' ? 40 : 0))).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={processing || cartItems.length === 0 || 
                        (paymentMethod === 'Wallet' && walletBalance < total)}
                      className="w-full"
                    >
                      {processing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Address Modal */}
      <Sheet open={showAddModal} onOpenChange={setShowAddModal}>
        <SheetContent>
          <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
          <form onSubmit={handleAddAddress} className="space-y-4">
            <input
              value={newAddress.street}
              onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
              placeholder="Street"
              className="w-full p-2 rounded-lg border border-border bg-background"
              required
            />
            <input
              value={newAddress.city}
              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
              placeholder="City"
              className="w-full p-2 rounded-lg border border-border bg-background"
              required
            />
            <input
              value={newAddress.state}
              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
              placeholder="State"
              className="w-full p-2 rounded-lg border border-border bg-background"
              required
            />
            <input
              value={newAddress.country}
              onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
              placeholder="Country"
              className="w-full p-2 rounded-lg border border-border bg-background"
              required
            />
            <input
              value={newAddress.postalCode}
              onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
              placeholder="Postal Code"
              className="w-full p-2 rounded-lg border border-border bg-background"
              required
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                className="rounded border-border"
              />
              <span>Set as default address</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing}
              >
                {processing ? 'Adding...' : 'Add Address'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

          {/* Stripe Payment Modal */}
      {showStripePayment && (
        <Sheet open={showStripePayment} onOpenChange={setShowStripePayment}>
          <SheetContent>
            <h2 className="text-xl font-semibold mb-4">Credit Card Payment</h2>
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                onPaymentSuccess={handlePaymentSuccess}
                total={convertPrice(total)}
                currencySymbol={currencies[currency].symbol}
                selectedAddress={addresses[selectedAddress]}
              />
            </Elements>
          </SheetContent>
        </Sheet>
      )}

      <Footer />
    </div>
  );
};

export default CheckoutPage;