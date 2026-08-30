import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin
} from 'lucide-react';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenInstallApp?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-8 relative border-t-4 border-[#00875a] font-sans shadow-md" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-28 sm:pb-12">
        
        {/* 3 Headings Column Grid (Company, Policy, Contact) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pb-8 border-b border-slate-800">
          
          {/* HEADING 1: COMPANY */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2 border-l-2 border-[#00875a] pl-2.5">
              <span>Company</span>
            </h3>
            
            <ul className="space-y-2.5">
              {/* 1. About Us */}
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-emerald-500">›</span>
                  <span>About Us</span>
                </Link>
              </li>

              {/* 2. FAQ's */}
              <li>
                <Link
                  to="/faqs"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-emerald-500">›</span>
                  <span>Frequently Asked Questions (FAQs)</span>
                </Link>
              </li>

              {/* 3. Certified Electrician Services */}
              <li>
                <Link
                  to="/services"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-emerald-500">›</span>
                  <span>Electrical Contractor Services</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* HEADING 2: POLICY & LEGAL */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2 border-l-2 border-[#00875a] pl-2.5">
              <span>Policy &amp; Legal</span>
            </h3>

            <ul className="space-y-2.5">
              {/* 1. Privacy Policy */}
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                  id="footer-privacy-policy-link"
                >
                  <span className="text-emerald-500">›</span>
                  <span className="font-bold text-white">Privacy Policy</span>
                </Link>
              </li>

              {/* 2. Terms of Service */}
              <li>
                <Link
                  to="/terms"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                  id="footer-terms-of-service-link"
                >
                  <span className="text-emerald-500">›</span>
                  <span className="font-bold text-slate-200">Terms of Service</span>
                </Link>
              </li>

              {/* 3. Refund Policy */}
              <li>
                <Link
                  to="/refund-policy"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-emerald-500">›</span>
                  <span>Refund &amp; Cancellation Policy</span>
                </Link>
              </li>

              {/* 4. Shipping Policy */}
              <li>
                <Link
                  to="/shipping-policy"
                  className="text-slate-300 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-emerald-500">›</span>
                  <span>Shipping &amp; Delivery Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* HEADING 3: CONTACT */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2 border-l-2 border-[#00875a] pl-2.5">
              <span>Contact &amp; Depot</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">BuildNow Central Store &amp; Depot</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    Bediadanga 1st Ln, Nator Park, Kasba, Kolkata, West Bengal 700039, India
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Official Support Email</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    <a href="mailto:team@girirajpower.in" className="text-sky-300 hover:underline">
                      team@girirajpower.in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-6 flex items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} BuildNow. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
