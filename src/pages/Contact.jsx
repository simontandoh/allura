import FadeInWhenVisible from "../components/FadeInWhenVisible";

function Contact() {
  return (
    <div className="py-20 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">Contact Us</h1>
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.2}>
        <form className="max-w-xl mx-auto bg-burgundy/40 p-8 rounded-2xl shadow-lg">
          <div className="mb-6">
            <label className="block mb-2 text-sm">Full Name</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg text-burgundy focus:outline-none"
              placeholder="Jane Doe"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg text-burgundy focus:outline-none"
              placeholder="jane@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm">Message</label>
            <textarea
              className="w-full p-3 rounded-lg text-burgundy focus:outline-none h-32"
              placeholder="How can we help?"
            ></textarea>
          </div>

          <button className="btn-gold w-full py-3 text-lg">Send Message</button>
        </form>
      </FadeInWhenVisible>
    </div>
  );
}

export default Contact;
