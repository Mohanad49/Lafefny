require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QP8ZuEtF2Lqtv9Ot7NSnBhK0kJZETF9drygd2IHJekzjAMrwZPIEs3yQqPLPQn4sKHg9lpgInOQZ7hs2nyYMMqC00GMInqDLx');

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