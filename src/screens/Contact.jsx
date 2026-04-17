import { useState } from "react";
import FadeInWhenVisible from "../components/FadeInWhenVisible";
import { db } from "../firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please complete every field.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "contactMessages"), {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        message: form.message.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      toast.success("Message sent. We'll be in touch.");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("There was a problem sending your message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-16 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">Contact Us</h1>
      </FadeInWhenVisible>

      <FadeInWhenVisible delay={0.2}>
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-burgundy/40 p-8 rounded-2xl shadow-lg space-y-6"
        >
          <div>
            <label className="block mb-2 text-sm tracking-[0.3em] uppercase">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg text-burgundy focus:outline-none"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm tracking-[0.3em] uppercase">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg text-burgundy focus:outline-none"
              placeholder="jane@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm tracking-[0.3em] uppercase">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="w-full p-3 rounded-lg text-burgundy focus:outline-none h-32"
              placeholder="How can we help?"
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-gold w-full py-3 text-lg">
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </FadeInWhenVisible>
    </div>
  );
}

export default Contact;

