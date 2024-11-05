// services/currencyService.js
const EXCHANGE_API_KEY = 'a6ef7b85eab930c5bf44ae65';

export const fetchExchangeRates = async () => {
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`);
    const data = await response.json();
    if (data.result === "success") {
      return data.conversion_rates;
    }
    throw new Error('Failed to fetch rates');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};