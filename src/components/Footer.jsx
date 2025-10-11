import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-burgundy text-gold border-t border-gold/20 mt-16">
      <div className="max-w-7xl mx-auto py-12 px-6 md:px-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* === Brand Section === */}
        <div>
          <h2 className="text-3xl font-elegant mb-3"><b>ALLÜRA</b></h2>
          <p className="opacity-80 leading-relaxed">
            Redefining beauty with premium, handcrafted luxury hair collections.
          </p>
        </div>

        {/* === Quick Links === */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/shop" className="hover:text-white transition">
                Shop
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="hover:text-white transition">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-white transition">
                Admin
              </Link>
            </li>
          </ul>
        </div>

        {/* === Legal Section === */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/privacy-policy" className="hover:text-white transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white transition">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-white transition">
                Returns Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center py-6 border-t border-gold/20 opacity-70 text-sm">
        © {new Date().getFullYear()} Allura. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
