/* eslint-disable react/prop-types */
// src/context/CurrencyContext.jsx
import { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const currencies = {
  USD: { symbol: '$', rate: 0.032 },
  EUR: { symbol: '€', rate: 0.030 },
  GBP: { symbol: '£', rate: 0.026 },
  JPY: { symbol: '¥', rate: 3.62 },
  AUD: { symbol: 'A$', rate: 0.049 },
  EGP: { symbol: 'E£', rate: 1 }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);