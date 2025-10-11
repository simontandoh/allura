import FadeInWhenVisible from "../components/FadeInWhenVisible";

function TermsAndConditions() {
  return (
    <div className="py-20 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">
          Terms & Conditions
        </h1>
        <div className="max-w-3xl mx-auto space-y-6 text-base leading-relaxed opacity-90">
          <p>
            Welcome to Allura. By using our website, you agree to these Terms &
            Conditions. Please read them carefully before making a purchase.
          </p>
          <p>
            All products are sold subject to availability. We reserve the right
            to update product information, pricing, and promotions at any time.
          </p>
          <p>
            Orders placed through our website constitute an agreement to
            purchase under these terms. Payment must be made in full before
            shipment.
          </p>
          <p>
            Allura is not responsible for delays due to courier or customs
            processing. We take all reasonable measures to ensure your order is
            delivered safely and promptly.
          </p>
        </div>
      </FadeInWhenVisible>
    </div>
  );
}

export default TermsAndConditions;
