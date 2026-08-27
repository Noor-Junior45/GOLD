import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  Mail,
  Phone,
  MapPin,
  RotateCcw,
  Truck,
  HelpCircle,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

export type LegalPageType = 'privacy' | 'terms' | 'refund' | 'shipping' | 'about' | 'faqs';

interface LegalViewProps {
  onBack: () => void;
  type: LegalPageType;
}

export const LegalView: React.FC<LegalViewProps> = ({ onBack, type }) => {
  const effectiveDate = 'August 20, 2026';

  // Always reset scroll to top when legal view opens or changes type
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [type]);

  const getPageMeta = () => {
    switch (type) {
      case 'about':
        return {
          title: 'About Us',
          subtitle: 'Kolkata’s Premier Industrial Electrical & Building Material Hub',
          icon: Building2,
          badge: 'Company Profile'
        };
      case 'faqs':
        return {
          title: 'Frequently Asked Questions (FAQ)',
          subtitle: 'Quick answers about ordering, 60-min delivery, bulk discounts & GST invoices',
          icon: HelpCircle,
          badge: 'Help Center'
        };
      case 'refund':
        return {
          title: 'Refund & Cancellation Policy',
          subtitle: 'Hassle-free 7-day replacements, instant wallet credits and bank refunds',
          icon: RotateCcw,
          badge: 'Customer Protection'
        };
      case 'shipping':
        return {
          title: 'Shipping & Delivery Policy',
          subtitle: '60-Minute express dispatch and heavy material site truck delivery across Kolkata',
          icon: Truck,
          badge: 'Logistics Policy'
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'How Giriraj Power protects and handles your account and order information',
          icon: Lock,
          badge: ''
        };
      case 'terms':
      default:
        return {
          title: 'Terms of Service',
          subtitle: 'Rules and conditions governing our marketplace, materials, and services',
          icon: FileText,
          badge: ''
        };
    }
  };

  const meta = getPageMeta();
  const IconComponent = meta.icon;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-amber-600" />
            <h1 className="text-base sm:text-lg font-black text-slate-900">
              {meta.title}
            </h1>
          </div>
        </div>

        {meta.badge ? (
          <span className="text-[11px] font-bold text-slate-600 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full">
            {meta.badge}
          </span>
        ) : null}
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
              <IconComponent className="w-6 h-6 text-white" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {meta.title}
              </h2>
              <p className="text-xs text-amber-100">
                Giriraj Power &amp; Electricals Kolkata • Last Updated: {effectiveDate}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/90 leading-relaxed mt-2">
            {meta.subtitle}
          </p>
        </div>

        {/* Dynamic Content */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6 text-xs text-slate-700 leading-relaxed">
          
          {/* 1. ABOUT US VIEW */}
          {type === 'about' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Who We Are
                </h3>
                <p>
                  <strong>Giriraj Power</strong> is Kolkata’s leading industrial supply network and specialized quick-commerce distributor for electrical wiring, switchgear, PVC conduits, cement, TMT steel, and architectural building materials. Headquartered at our central Kasba warehouse depot, we supply retail homeowners, contractors, commercial builders, and licensed electrical engineers with 100% genuine factory products.
                </p>
              </section>

              <section className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Our Core Pillars
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>60-Minute Kolkata Express Hub</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Our rapid dispatch riders reach residential and commercial job sites across Kolkata in under 60 minutes for urgent electrical repairs and installations.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>100% Authorized Genuine Brands</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Direct factory sourcing from RR Kabel, Polycab, Finolex, Schneider, Anchor Panasonic, UltraTech, Tata Tiscon, Dr. Fixit, and Astral Pipes with complete manufacturer warranties.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span>Wholesale Builder Pricing</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Eliminating middleman markups so contractors and property developers get direct factory rates with standard GST input tax credit invoices.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Certified Wiring &amp; Repair Services</span>
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Background-verified, licensed electricians ready for on-site diagnosis, short circuit troubleshooting, switchboard fittings, and full-apartment wiring.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 2. FAQ VIEW */}
          {type === 'faqs' && (
            <div className="space-y-4">
              <section className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                  1. How fast is express delivery?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Electrical supplies, cables, switches, and tools are dispatched directly from our central Kasba warehouse depot and delivered to locations within Kolkata on the same day with priority handling.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                  2. How do heavy construction deliveries (cement, TMT bars) work?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Bulk construction materials such as UltraTech cement bags and Tata Tiscon steel rebars are delivered via dedicated mini-trucks with scheduled site unloading across Greater Kolkata within 2 to 4 hours.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                  3. Do you provide official GST Tax Invoices?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Yes, 100% of orders come with formal GST tax invoices that you can use to claim your GST input tax credit (ITC) for business and contractor filings.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                  4. Can I return unused wire coils or unopened switches?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Yes, we offer a 7-day return policy for unopened, unstripped wire coils and sealed electrical items with instant Giriraj Wallet or original payment method refunds.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                  5. How do I get contractor bulk discounts?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  You can click on the WhatsApp button in the header or footer or reach our contractor desk at +91 87774 00280 with your Bill of Quantities (BOQ) for tiered wholesale quotations.
                </p>
              </section>
            </div>
          )}

          {/* 3. REFUND POLICY VIEW */}
          {type === 'refund' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  1. Product-Specific Refund &amp; Return Eligibility
                </h3>
                <p>
                  At Giriraj Power, refund and return acceptance is strictly <strong>applicable only to select eligible products and categories</strong>. Refund terms and eligibility may vary depending on the product type, manufacturer warranty guidelines, and material nature:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Standard Electrical Hardware:</strong> Standard boxed modular switches, socket units, and MCBs/DB panels are return-eligible within the return window.</li>
                  <li><strong>Wire &amp; Cable Coils:</strong> Only full, unbroken, factory-sealed coils with intact plastic wrapping and manufacturer holograms qualify for returns.</li>
                  <li><strong>Heavy &amp; Bulk Construction Supplies:</strong> Bagged cement, customized TMT steel cuts, mixed paints, tinted coatings, and chemical waterproofing liquids are non-returnable once dispatched to site.</li>
                </ul>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. 7-Day Return Condition &amp; Sealed Packaging Rule
                </h3>
                <p>
                  For all return-eligible items, return requests must be raised <strong>strictly within 7 days after delivery</strong>.
                </p>
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1.5">
                  <p className="font-bold text-amber-950">Mandatory Packaging &amp; Damage-Free Requirement:</p>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    To be eligible for a return or replacement, the product must be <strong>completely intact, unused, undamaged, packed in its original manufacturer carton/box, and securely sealed with no sign of tampering, wear, physical dents, or stripped wires</strong>. Any product returned unsealed, stripped, altered, or damaged will be rejected upon physical inspection at the depot.
                  </p>
                </div>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  3. Non-Returnable Items &amp; Exclusions
                </h3>
                <p>Returns and refunds are strictly not accepted for:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Cables, wires, or conduits cut or unrolled from bulk industrial drums or reels.</li>
                  <li>Opened, unsealed, or partially consumed adhesives, waterproofing slurries, putty, or paints.</li>
                  <li>Special custom-ordered switchgear configurations or customized fabrication items.</li>
                  <li>Products damaged due to electrical surge, incorrect site installation, or moisture exposure post-delivery.</li>
                </ul>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  4. Refund Processing &amp; Settlement Timelines
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-black text-slate-900">⚡ Giriraj Wallet Refund (Instant)</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Credited immediately upon successful depot verification and inspection with zero deduction.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-black text-slate-900">🏦 Original UPI / Bank Account Refund</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Processed to your original payment method / bank account within 3 to 5 business banking days.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 4. SHIPPING POLICY VIEW */}
          {type === 'shipping' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  1. Delivery Timelines &amp; Warehouse Distance Factors
                </h3>
                <p>
                  While our electrical quick-dispatch fleets endeavor to fulfill orders rapidly, <strong>shipping and delivery time may vary and might take additional time</strong> based on:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li><strong>Warehouse Distance:</strong> Radial transit distance between our central Kasba warehouse depot and your destination address across Greater Kolkata &amp; Bengal.</li>
                  <li><strong>Plot &amp; Construction Site Location:</strong> Accessibility of interior residential lanes, unpaved approach roads, high-rise lift access, or restricted commercial building zones.</li>
                  <li><strong>Heavy Load &amp; Traffic Windows:</strong> Truck movement restrictions during peak municipal Kolkata traffic hours.</li>
                </ul>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. Dynamic Shipping Charges Based on Product &amp; Purchase
                </h3>
                <p>
                  <strong>Shipping charges are calculated based on the specific product type, total weight/volume, and purchase value:</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-black text-slate-900">📦 Standard &amp; Express Parcel Delivery</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Small electrical items, switches, wire bundles, and tools are dispatched with flat nominal delivery fees (Free on qualified minimum purchase thresholds).
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-black text-slate-900">🚛 Heavy Bulk Site Logistics (Freight)</p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Cement bags, steel rebars, and heavy pipes involve specialized freight rates computed by metric weight, truck capacity, and drop-off plot distance.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  3. Site Unloading &amp; Receipt Inspection
                </h3>
                <p className="text-slate-600">
                  Customers or their designated site supervisors must be present to inspect packaging seals, counts, and batch tags at the time of truck arrival before signing the electronic delivery challan.
                </p>
              </section>
            </div>
          )}

          {/* 5. PRIVACY POLICY VIEW */}
          {type === 'privacy' && (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  1. Information We Collect
                </h3>
                <p>
                  Giriraj Power collects only necessary information required to process and dispatch orders, schedule verified electrician visits, compute accurate location-based shipping charges, and authenticate your account securely:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong className="text-slate-900">Personal &amp; Contact Details:</strong> Full Name, Email Address, Phone Number.</li>
                  <li><strong className="text-slate-900">Delivery &amp; Location Information:</strong> GPS pin location, street addresses, plot coordinates, and site landmarks.</li>
                  <li><strong className="text-slate-900">Google OAuth Identity Data:</strong> Public Name, Email Address, and Avatar Photo solely to create and personalize your account profile.</li>
                  <li><strong className="text-slate-900">Order &amp; Transaction Logs:</strong> Items purchased, GST numbers, and payment status.</li>
                </ul>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. Google API &amp; OAuth User Data Compliance
                </h3>
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1.5">
                  <p className="font-bold text-blue-950">Limited Use Compliance:</p>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Giriraj Power complies strictly with the <strong>Google API Services User Data Policy</strong>, including Limited Use requirements. We will never sell or transfer Google data to third parties.
                  </p>
                </div>
              </section>
            </>
          )}

          {/* 6. TERMS OF SERVICE VIEW */}
          {type === 'terms' && (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  1. Acceptance of Terms &amp; Product Pricing
                </h3>
                <p>
                  By browsing, logging into, or placing orders with Giriraj Power, you agree to these Terms of Service. All materials sold are authentic, genuine, and sourced directly from certified manufacturers. Prices, wholesale discounts, and product availability are subject to market conditions and location constraints.
                </p>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  2. Product Delivery, Return Conditions &amp; Shipping Charges
                </h3>
                <p>
                  All purchases are subject to our <strong>Shipping &amp; Delivery Policy</strong> and <strong>Refund &amp; Return Policy</strong>:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Shipping fees depend on the specific product purchased, weight, and distance to the delivery plot/warehouse.</li>
                  <li>Delivery timelines are indicative and may vary based on warehouse distance and site accessibility.</li>
                  <li>Refunds and returns are accepted for eligible products only when requested within 7 days of delivery, provided products remain completely intact, undamaged, and in sealed original packaging.</li>
                </ul>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  3. Licensed Electrician &amp; Wiring Services
                </h3>
                <p>
                  Electrician visits booked through our platform connect you with certified electrical technicians for apartment wiring, diagnostics, and repairs. Standard diagnostic fees are confirmed before dispatch.
                </p>
              </section>
            </>
          )}

          {/* CONTACT & COMPANY DETAILS FOOTER */}
          <div className="pt-6 border-t border-slate-200/80 bg-slate-50/80 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-2xl space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Corporate &amp; Dispatch Hub
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Store &amp; Depot</p>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Giriraj Power, Bediadanga 1st Ln, Nator Park, Kasba, Kolkata 700039
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Helpline Numbers</p>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    <strong className="text-slate-800">Business WP:</strong> +91 87774 00280<br />
                    <strong className="text-slate-800">Contractor:</strong> +91 90071 68561
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Email Desk</p>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    <a href="mailto:team@girirajpower.in" className="text-blue-700 hover:underline">
                      team@girirajpower.in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
