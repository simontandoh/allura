import { useEffect, useRef, useState } from "react";
import { useCurrency } from "../hooks/useCurrency.js";

const options = [
  { code: "GBP", label: "United Kingdom", flag: "\uD83C\uDDEC\uD83C\uDDE7" },
  { code: "USD", label: "United States", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { code: "EUR", label: "Eurozone", flag: "\uD83C\uDDEA\uD83C\uDDFA" },
];

function CurrencySelector({ compact = false }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const selectorRef = useRef(null);

  const active = options.find((opt) => opt.code === currency) || options[0];

  useEffect(() => {
    const handleClick = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (code) => {
    setCurrency(code);
    setOpen(false);
  };

  const buttonClass = compact
    ? "min-w-[3.5rem] h-9 rounded-full border border-gold/40 text-gold flex items-center justify-center px-3 hover:bg-gold hover:text-burgundy transition text-[11px] font-semibold"
    : "flex items-center gap-2 border border-gold/40 text-gold px-3 py-1.5 rounded-full hover:bg-gold hover:text-burgundy transition text-sm font-semibold";

  return (
    <div ref={selectorRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={buttonClass}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {!compact && (
          <span className="text-lg leading-none" role="img" aria-label={active.label}>
            {active.flag}
          </span>
        )}
        <span className={compact ? "tracking-[0.2em]" : undefined}>{active.code}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-burgundy border border-gold/20 shadow-lg py-2 z-30">
          {options.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => handleSelect(opt.code)}
              className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#5C0020] ${
                opt.code === currency ? "text-gold" : "text-gold/80"
              }`}
            >
              <span className="text-lg" role="img" aria-label={opt.label}>
                {opt.flag}
              </span>
              <div>
                <p className="text-sm font-semibold">{opt.code}</p>
                <p className="text-xs opacity-70">{opt.label}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;

