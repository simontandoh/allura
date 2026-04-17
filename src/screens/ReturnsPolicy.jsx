import FadeInWhenVisible from "../components/FadeInWhenVisible";

function ReturnsPolicy() {
  return (
    <div className="pt-28 pb-16 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">Returns Policy</h1>
        <div className="max-w-3xl mx-auto space-y-6 text-base leading-relaxed opacity-90">
          <p>
            We want you to love your Allura purchase. If you are not fully satisfied, you may return unused products within 14 days of delivery.
          </p>
          <p>
            Returned products must be in their original condition, packaging intact, and unworn. For hygiene reasons, opened hair products cannot be returned.
          </p>
          <p>
            To initiate a return, please contact our customer care team with your order details. Refunds will be processed within 7 working days after inspection.
          </p>
          <p>
            Exchanges are subject to stock availability.
          </p>
        </div>
      </FadeInWhenVisible>
    </div>
  );
}

export default ReturnsPolicy;

