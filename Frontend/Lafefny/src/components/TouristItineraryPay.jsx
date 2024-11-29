/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51QP8ZuEtF2Lqtv9O8kg1FunK3YF9xXxeVt1oSsxe07QZHIZUOShRYHBjTYUrFcY61iQzfljEA6AT3ozj44mfPM9I00c9XZdQuA');

const TouristItineraryPay = () => {
  const location = useLocation();
  const { touristId, itineraryId } = location.state || {};
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [promoError, setPromoError] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingResponse = await axios.get(`http://localhost:8000/touristItinerary/${itineraryId}`);
        setBooking(bookingResponse.data);
        setDiscountedPrice(bookingResponse.data.price); // Set initial price
      } catch (err) {
        setError('Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (itineraryId && touristId) {
      fetchBooking();
    }
  }, [itineraryId, touristId]);

  // Apply promo code
  const handleApplyPromoCode = async () => {
    setPromoError('');
    try {
      const response = await axios.post(`http://localhost:8000/promos/validate`, {
        promoCode,
        touristId,
        originalPrice: booking.price, // Pass the original price to the backend
      });
      setDiscountedPrice(response.data.discountedPrice); // Update the discounted price
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Error validating promo code');
      setDiscountedPrice(booking.price); // Reset to original price on error
    }
  };

  // Handle card payment
  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

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
      await axios.post(`http://localhost:8000/tourist/${itineraryId}/payment`, {
        method: 'card',
        paymentMethodId: paymentMethod.id,
        touristId,
        amount: discountedPrice, // Send the discounted price
      });
      alert('Payment successful');
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed');
    }
  };

  // Handle wallet payment
  const handleWalletPayment = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/tourist/${itineraryId}/payment`, {
        method: 'wallet',
        touristId,
        amount: discountedPrice, // Send the discounted price
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
          <p>Original Price: {booking.price} EGP</p>
          <p>
            Discounted Price: {discountedPrice !== null && discountedPrice !== undefined
              ? discountedPrice.toFixed(2)
              : booking.price} EGP
          </p>
          <div>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
            />
            <button onClick={handleApplyPromoCode}>Apply Promo Code</button>
            {promoError && <p style={{ color: 'red' }}>{promoError}</p>}
          </div>
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
