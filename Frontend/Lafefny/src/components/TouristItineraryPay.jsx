import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51QP8ZuEtF2Lqtv9O8kg1FunK3YF9xXxeVt1oSsxe07QZHIZUOShRYHBjTYUrFcY61iQzfljEA6AT3ozj44mfPM9I00c9XZdQuA'); // Replace with your Stripe publishable key

const TouristItineraryPay = () => {
  const location = useLocation();
  const { touristId, itineraryId } = location.state || {};
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    console.log('useEffect triggered');
    console.log('itineraryId:', itineraryId);
    console.log('touristId:', touristId);

    const fetchBooking = async () => {
      try {
        console.log('Fetching booking details...');
        const bookingResponse = await axios.get(`http://localhost:8000/touristItinerary/${itineraryId}`);
        console.log('Booking response:', bookingResponse.data);
        setBooking(bookingResponse.data);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (itineraryId && touristId) {
      fetchBooking();
    } else {
      console.error('Missing itineraryId or touristId');
      setLoading(false);
    }
  }, [itineraryId, touristId]);

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    if (booking.paidBy.includes(touristId)) {
        alert('You have already paid for this itinerary');
        return;
      }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error('Payment method error:', error);
      alert('Payment failed');
      return;
    }

    console.log('PaymentMethod created:', paymentMethod.id);

    try {
      console.log('Making payment request...');
      await axios.post(`http://localhost:8000/tourist/${itineraryId}/payment`, {
        method: 'card',
        paymentMethodId: paymentMethod.id,
        touristId,
      });
      alert('Payment successful');
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed');
    }
  };

  const handleWalletPayment = async () => {
    if (booking.paidBy.includes(touristId)) {
        alert('You have already paid for this itinerary');
        return;
    }

    try {
      console.log('Making wallet payment request...');
      const response = await axios.post(`http://localhost:8000/tourist/${itineraryId}/payment`, {
        method: 'wallet',
        touristId,
      });
      const { remainingBalance } = response.data;
      alert(`Payment successful. Remaining balance: ${remainingBalance} EGP`);
    } catch (err) {
      console.error('Wallet payment error:', err);
      alert('Payment failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Tourist Itinerary Payment</h1>
      {booking && (
        <div>
          <h2>{booking.name}</h2>
          <p>Price: {booking.price} EGP</p>
          <form onSubmit={handleCardPayment}>
            <CardElement />
            <button type="submit" disabled={!stripe}>Pay with Card</button>
          </form>
          <button onClick={handleWalletPayment}>Pay with Wallet</button>
        </div>
      )}
    </div>
  );
};

const TouristItineraryPayWrapper = () => (
  <Elements stripe={stripePromise}>
    <TouristItineraryPay />
  </Elements>
);

export default TouristItineraryPayWrapper;