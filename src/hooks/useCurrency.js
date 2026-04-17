import { useContext } from "react";
import { CurrencyContext } from "../context/CurrencyContext.jsx";

export const useCurrency = () => useContext(CurrencyContext);
