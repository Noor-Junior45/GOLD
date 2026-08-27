import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Download
} from 'lucide-react';

interface FooterProps {
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenInstallApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInstallApp }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-16 relative border-t-4 border-amber-400 font-sans shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        
        {/* 3 Headings Column Grid (Company, Policy, Contact) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pb-10 border-b border-slate-800">
          
          {/* HEADING 1: COMPANY */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2 border-l-2 border-amber-400 pl-2.5">
              <span>Company</span>
            </h3>
            
            <ul className="space-y-2.5">
              {/* 1. About Us */}
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-amber-500">›</span>
                  <span>About Us</span>
                </Link>
              </li>

              {/* 2. FAQ's */}
              <li>
                <Link
                  to="/faqs"
                  className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-amber-500">›</span>
                  <span>FAQ's</span>
                </Link>
              </li>

              {/* 3. Download App */}
              {onOpenInstallApp && (
                <li>
                  <button
                    onClick={onOpenInstallApp}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="text-emerald-500">›</span>
                    <span className="flex items-center gap-1">
                      <span>Download App</span>
                      <Download className="w-3 h-3 text-emerald-400" />
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* HEADING 2: POLICY */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2 border-l-2 border-amber-400 pl-2.5">
              <span>Policy</span>
            </h3>

            <ul className="space-y-2.5">
              {/* 1. Refund Policy */}
              <li>
                <Link
                  to="/refund-policy"
                  className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-amber-500">›</span>
                  <span>Refund Policy</span>
                </Link>
              </li>

              {/* 2. Privacy Policy */}
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-amber-500">›</span>
                  <span>Privacy Policy</span>
                </Link>
              </li>

              {/* 3. Terms of Services */}
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-amber-500">›</span>
                  <span>Terms of Services</span>
                </Link>
              </li>

              {/* 4. Shipping Policy */}
              <li>
                <Link
                  to="/shipping-policy"
                  className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-amber-500">›</span>
                  <span>Shipping Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* HEADING 3: CONTACT */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2 border-l-2 border-amber-400 pl-2.5">
              <span>Contact</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Central Store &amp; Depot</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    Bediadanga 1st Ln, Nator Park, Kasba, Kolkata, West Bengal 700039
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Email Address</p>
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

        {/* Bottom Bar: Copyright & Version */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Certified Depot • Serving Kolkata</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/40">
              v2.4.0
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
