import { createContext, useContext, useState, useMemo } from "react";

const CurrencyContext = createContext();

const rates = {
  GBP: 1,
  USD: 1.27, // adjust based on current exchange
  EUR: 1.17,
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("GBP");

  const convertPrice = (priceGBP) => {
    const rate = rates[currency];
    return priceGBP * rate;
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

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
