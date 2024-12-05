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

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51QP7WoG4UGkAwtrqHrV9BgIvG1T8ZNjqOpbKq9W8kD4xwUcmNCegaX0jOnKzU1JNckplg9MIomiIhdGEt3e1FFHn007MSX3aFl');

// Separate component for Stripe payment form
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
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false
  });
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userID');
        
        // Fetch cart items
        const cartResponse = await axios.get(`http://localhost:8000/tourist/${userId}/cart`);
        setCartItems(cartResponse.data);

        // Fetch addresses
        const addressResponse = await axios.get(`http://localhost:8000/tourist/${userId}/addresses`);
        setAddresses(addressResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load checkout data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const createOrder = async (paymentMethod) => {
    try {
      const userId = localStorage.getItem('userID');
      if (!userId) {
        throw new Error('User ID not found');
      }

      console.log('Creating order with data:', {
        userId,
        cartItems,
        total,
        paymentMethod,
        selectedAddress
      });

      const orderData = {
        products: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod: paymentMethod,
        selectedAddress: selectedAddress
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post(
        `http://localhost:8000/tourist/${userId}/orders`,
        orderData
      );

      console.log('Order creation response:', response.data);
      alert('Order placed successfully!');
      navigate('/touristHome');
    } catch (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to create order: ' + (error.response?.data?.error || error.message));
      throw error;
    }
  };

  const handleCashOrder = async () => {
    try {
      if (!selectedAddress) {
        alert('Please select a delivery address');
        return;
      }
      if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
      }
      console.log('Processing cash order...');
      await createOrder('Cash on Delivery');
    } catch (error) {
      console.error('Cash order error:', error);
      alert(error.message);
    }
  };

  const handleWalletPayment = async () => {
    try {
      if (!selectedAddress) {
        alert('Please select a delivery address');
        return;
      }
      // Add wallet balance check here if needed
      await createOrder('Wallet');
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await createOrder('Credit Card');
    } catch (error) {
      alert('Payment successful but failed to create order. Please contact support.');
    }
  };

  const handleAddAddress = async () => {
    try {
      if (!newAddress.street || !newAddress.city || !newAddress.state || 
          !newAddress.country || !newAddress.postalCode) {
        alert('Please fill in all fields');
        return;
      }

      const userId = localStorage.getItem('userID');
      const response = await axios.post(
        `http://localhost:8000/tourist/${userId}/addresses`,
        newAddress
      );

      // Update addresses list
      setAddresses(response.data);
      setShowAddModal(false);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        isDefault: false
      });
      alert('Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address: ' + (error.response?.data?.error || error.message));
    }
  };

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setShowStripePayment(method === 'Credit Card');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="checkout-container">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/tourist/cart')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>
        <h1 className="checkout-header">Checkout</h1>
      </div>

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
                <td>EGP{item.price}</td>
                <td>{item.quantity}</td>
                <td>EGP{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3"><strong>Total</strong></td>
              <td><strong>EGP{total.toFixed(2)}</strong></td>
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
                className={`address-card ${selectedAddress === address ? 'selected' : ''}`}
                onClick={() => setSelectedAddress(address)}
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
          >
            {paymentMethod === 'Wallet' ? 'Pay with Wallet' : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;