import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.73 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 110.0 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.25 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.35 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.92 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 6.45 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 74.5 },
];

export function useCurrency() {
  const { i18n } = useTranslation();
  const [baseCurrency, setBaseCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('baseCurrency');
    if (savedCurrency) {
      const currency = SUPPORTED_CURRENCIES.find(c => c.code === savedCurrency);
      if (currency) {
        setBaseCurrency(currency);
      }
    }

    // Initialize exchange rates
    const rates: Record<string, number> = {};
    SUPPORTED_CURRENCIES.forEach(currency => {
      rates[currency.code] = currency.rate;
    });
    setExchangeRates(rates);
  }, []);

  const updateBaseCurrency = (currencyCode: string) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (currency) {
      setBaseCurrency(currency);
      localStorage.setItem('baseCurrency', currencyCode);
    }
  };

  const formatCurrency = (amount: number, currencyCode?: string): string => {
    const currency = currencyCode ? 
      SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) : 
      baseCurrency;
    
    if (!currency) return amount.toString();

    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  };

  const getSupportedCurrencies = (): Currency[] => {
    return SUPPORTED_CURRENCIES;
  };

  return {
    baseCurrency,
    exchangeRates,
    formatCurrency,
    convertCurrency,
    updateBaseCurrency,
    getSupportedCurrencies,
  };
}