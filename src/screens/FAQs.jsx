import FadeInWhenVisible from "../components/FadeInWhenVisible";

function FAQs() {
  const faqs = [
    {
      q: "How long does delivery take?",
      a: "All orders are processed within 1–2 business days and shipped via express delivery (1–3 days).",
    },
    {
      q: "Which payment methods can I use?",
      a: "We accept Visa, Mastercard, American Express, PayPal, Klarna Pay in 3, and Clearpay/Afterpay instalments. Select the Pay Later option at checkout to split your balance interest-free.",
    },
    {
      q: "Are Allura wigs made from real hair?",
      a: "Yes — Allura wigs are crafted using 100% premium human hair, ethically sourced and quality tested.",
    },
    {
      q: "Can I return or exchange my order?",
      a: "We accept returns on unused items within 14 days of receipt. Please see our Returns Policy for details.",
    },
  ];

  return (
    <div className="pt-28 pb-16 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">FAQs</h1>
      </FadeInWhenVisible>

      <div className="max-w-3xl mx-auto space-y-6">
        {faqs.map((f, i) => (
          <FadeInWhenVisible delay={i * 0.1} key={i}>
            <div className="border-b border-gold/20 pb-4">
              <h2 className="text-xl font-semibold mb-2">{f.q}</h2>
              <p className="opacity-90">{f.a}</p>
            </div>
          </FadeInWhenVisible>
        ))}
      </div>
    </div>
  );
}

export default FAQs;

