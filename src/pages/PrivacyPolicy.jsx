import FadeInWhenVisible from "../components/FadeInWhenVisible";

function PrivacyPolicy() {
  return (
    <div className="py-20 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">Privacy Policy</h1>
        <div className="max-w-3xl mx-auto space-y-6 text-base leading-relaxed opacity-90">
          <p>
            At Allura, we respect your privacy. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p>
            We only collect data necessary to process your orders, improve your experience, and communicate updates.
          </p>
          <p>
            Your information is stored securely and never shared with third parties without consent. You can request deletion or access to your data at any time.
          </p>
          <p>
            By using our website, you agree to the terms outlined in this policy.
          </p>
        </div>
      </FadeInWhenVisible>
    </div>
  );
}

export default PrivacyPolicy;
