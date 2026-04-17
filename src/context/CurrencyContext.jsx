import { createContext, useEffect, useMemo, useRef, useState } from "react";

export const CurrencyContext = createContext(null);

const rates = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
};

const STORAGE_KEY = "allurahouse_currency";

const detectInitialCurrency = () => {
  if (typeof window === "undefined") return "GBP";
  return window.localStorage.getItem(STORAGE_KEY) || "GBP";
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(detectInitialCurrency);
  const hasStoredPreference = useRef(
    typeof window !== "undefined" && Boolean(window.localStorage.getItem(STORAGE_KEY))
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, currency);
    hasStoredPreference.current = true;
  }, [currency]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (hasStoredPreference.current) return;

    const detectCurrency = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const country = data.country_code;

        if (country === "US") setCurrency("USD");
        else if (["FR", "DE", "IT", "ES", "NL", "IE", "BE", "PT"].includes(country))
          setCurrency("EUR");
        else setCurrency("GBP");
      } catch (error) {
        console.warn("Currency detection failed:", error);
        setCurrency("GBP");
      }
    };

    detectCurrency();
  }, []);

  const convertPrice = (priceGBP = 0) => {
    const rate = rates[currency] || 1;
    return (Number(priceGBP) || 0) * rate;
  };

  const symbol = useMemo(() => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "£";
    }
  }, [currency]);

  const formatPrice = (amount, digits = 2) => {
    const value = convertPrice(amount);
    return `${symbol}${value.toFixed(digits)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, convertPrice, symbol, formatPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
