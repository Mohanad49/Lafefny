import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51QP8ZuEtF2Lqtv9O8kg1FunK3YF9xXxeVt1oSsxe07QZHIZUOShRYHBjTYUrFcY61iQzfljEA6AT3ozj44mfPM9I00c9XZdQuA'); // Replace with your Stripe publishable key

const TouristPayment = () => {
  const location = useLocation();
  const { touristId, activityId } = location.state || {};
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingResponse = await axios.get(`http://localhost:8000/activities/${activityId}`);
        setBooking(bookingResponse.data);
      } catch (err) {
        setError('Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (activityId && touristId) {
      fetchBooking();
    }
  }, [activityId, touristId]);

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    if (booking.paidBy.includes(touristId)) {
      alert('You have already paid for this activity');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      alert('Payment failed');
      return;
    }

    try {
      await axios.post(`http://localhost:8000/tourist/${activityId}/pay`, {
        method: 'card',
        paymentMethodId: paymentMethod.id,
        touristId,
      });
      alert('Payment successful');
    } catch (err) {
      alert('Payment failed');
    }
  };

  const handleWalletPayment = async () => {
    
    if (booking.paidBy.includes(touristId)) {
      alert('You have already paid for this activity');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/tourist/${activityId}/pay`, {
        method: 'wallet',
        touristId,
      });
      const { remainingBalance } = response.data;
      alert(`Payment successful. Remaining balance: ${remainingBalance} EGP`);
    } catch (err) {
      alert('Payment failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Tourist Payment</h1>
      {booking && (
        <div>
          <h2>{booking.name}</h2>
          <p>Price: {booking.price} EGP</p>
          <form onSubmit={handleCardPayment}>
            <CardElement />
            <button type="submit" disabled={!stripe}>Pay by Debit/Credit Card</button>
          </form>
          <button onClick={handleWalletPayment}>Pay by Wallet</button>
        </div>
      )}
    </div>
  );
};



const WrappedTouristPayment = () => (
  <Elements stripe={stripePromise}>
    <TouristPayment />
  </Elements>
);

export default WrappedTouristPayment;