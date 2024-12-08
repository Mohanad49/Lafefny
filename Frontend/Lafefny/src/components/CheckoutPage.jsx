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
import { ShoppingCart, CreditCard, MapPin, ArrowLeft } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useCurrency, currencies } from '../context/CurrencyContext';

const stripePromise = loadStripe('pk_test_51QP7WoG4UGkAwtrqHrV9BgIvG1T8ZNjqOpbKq9W8kD4xwUcmNCegaX0jOnKzU1JNckplg9MIomiIhdGEt3e1FFHn007MSX3aFl');

const StripePaymentForm = ({ onPaymentSuccess, total, selectedAddress }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

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
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
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
    
  const convertPrice = (price, reverse = false) => {
    if (!price) return 0;
    const numericPrice = typeof price === 'string' ? 
      parseFloat(price.replace(/[^0-9.-]+/g, "")) : 
      parseFloat(price);
      
    if (reverse) {
      return numericPrice / currencies[currency].rate;
    }
    const convertedPrice = numericPrice * currencies[currency].rate;
    return convertedPrice.toFixed(2);
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
      alert('Insufficient wallet balance');
      return;
    }

    try {
      setProcessing(true);
      const userId = localStorage.getItem('userID');
      
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
      await axios.post(`http://localhost:8000/tourist/${userId}/wallet/deduct`, {
        amount: total
      });

      alert('Order placed successfully!');
      navigate('/touristHome');
    } catch (error) {
      console.error('Wallet payment error:', error);
      alert(error.response?.data?.message || 'Failed to process wallet payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedAddress === null || selectedAddress < 0) {
      alert('Please select a delivery address');
      return;
    }

    if (!addresses[selectedAddress]) {
      alert('Selected address is invalid');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
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
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      if (!newAddress.street || !newAddress.city || !newAddress.state || 
          !newAddress.country || !newAddress.postalCode) {
        alert('Please fill in all fields');
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
      alert(error.response?.data?.message || 'Failed to add address');
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
      alert('Order placed successfully!');
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
        alert('Order placed successfully!');
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
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-16">
        <div className="checkout-container">
          {/* Back button styled consistently with other pages */}
          <button 
            onClick={() => navigate('/tourist/cart')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Cart
          </button>

          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <div className="order-summary">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </h2>
            </div>
            <table className="checkout-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div className="product-info">
                        <img src={item.imageUrl} alt={item.name} />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>{currencies[currency].symbol}{convertPrice(item.price)}</td>
                    <td>{item.quantity}</td>
                    <td>{currencies[currency].symbol}{convertPrice((item.price * item.quantity))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Total</strong></td>
                  <td><strong>{currencies[currency].symbol}{convertPrice(total)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="address-section">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </h2>
            {addresses.length === 0 ? (
              <p>No addresses found. Please add an address.</p>
            ) : (
              <div className="address-list">
                {addresses.map((address, index) => (
                  <div 
                    key={index} 
                    className={`address-card ${selectedAddress === index ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(index)}
                  >
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state}</p>
                    <p>{address.country}, {address.postalCode}</p>
                  </div>
                ))}
              </div>
            )}
            <button 
              className="add-address-btn"
              onClick={() => setShowAddModal(true)}
            >
              Add New Address
            </button>
          </div>

          {showAddModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>Add New Address</h3>
                <input
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  placeholder="Street"
                />
                <input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  placeholder="City"
                />
                <input
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                  placeholder="State"
                />
                <input
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                  placeholder="Country"
                />
                <input
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                  placeholder="Postal Code"
                />
                <label>
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                  />
                  Set as default
                </label>
                <div className="modal-actions">
                  <button onClick={handleAddAddress}>Add</button>
                  <button onClick={() => setShowAddModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="payment-section">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Wallet">Wallet</option>
            </select>

            {paymentMethod === 'Credit Card' && (
              <div className="stripe-payment-container">
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    onPaymentSuccess={handlePaymentSuccess}
                    total={total}
                    selectedAddress={selectedAddress}
                  />
                </Elements>
              </div>
            )}
          </div>

          {paymentMethod !== 'Credit Card' && (
            <div className="checkout-actions">
              <button 
                onClick={paymentMethod === 'Wallet' ? handleWalletPayment : handleCashOrder}
                disabled={!selectedAddress || cartItems.length === 0}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentMethod === 'Wallet' ? 'Pay with Wallet' : 'Place Order'}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;