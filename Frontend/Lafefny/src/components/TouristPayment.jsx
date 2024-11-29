/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51QP8ZuEtF2Lqtv9O8kg1FunK3YF9xXxeVt1oSsxe07QZHIZUOShRYHBjTYUrFcY61iQzfljEA6AT3ozj44mfPM9I00c9XZdQuA');

const TouristPayment = () => {
  const location = useLocation();
  const { touristId, activityId } = location.state || {};
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
        const bookingResponse = await axios.get(`http://localhost:8000/activities/${activityId}`);
        console.log('Booking details:', bookingResponse.data); // Debug log
        setBooking(bookingResponse.data);
        setDiscountedPrice(bookingResponse.data.price); // Set initial price
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (activityId && touristId) {
      fetchBooking();
    }
  }, [activityId, touristId]);

  // Handle promo code application
  const handleApplyPromoCode = async () => {
    setPromoError(''); // Reset error state
    try {
      const response = await axios.post(`http://localhost:8000/promos/validate`, {
        promoCode,
        touristId,
        originalPrice: booking.price, // Pass original price for backend calculation
      });

      console.log('Promo code response:', response.data); // Debug log

      // Use the discounted price returned from the backend
      setDiscountedPrice(response.data.discountedPrice);
    } catch (err) {
      console.error('Error applying promo code:', err.response?.data?.message || 'Unknown error');
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
      await axios.post(`http://localhost:8000/tourist/${activityId}/pay`, {
        method: 'card',
        paymentMethodId: paymentMethod.id,
        touristId,
        amount: discountedPrice, // Send discounted price
      });
      alert('Payment successful');
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
          <p>Original Price: {booking?.price} EGP</p>
          <p>
            Discounted Price: {discountedPrice !== null && discountedPrice !== undefined
              ? discountedPrice.toFixed(2)
              : booking?.price} EGP
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
            <button type="submit" disabled={!stripe}>Pay by Debit/Credit Card</button>
          </form>
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
