require('dotenv').config(); // Load environment variables from .env file
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const processCardPayment = async (paymentMethodId, amount) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects the amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    return { success: true, paymentIntent };
  } catch (error) {
    console.error('Error processing card payment:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { processCardPayment };