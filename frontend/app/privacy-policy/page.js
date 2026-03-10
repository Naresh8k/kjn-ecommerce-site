'use client';
import Link from 'next/link';
import {
  Shield, Database, Share2, Lock, Cookie,
  UserCheck, Mail, Phone, MapPin, ChevronRight,
} from 'lucide-react';

const SECTIONS = [
  {
    Icon: Database,
    title: 'Information We Collect',
    color: 'blue',
    items: [
      'Name, phone number, and email address — for account creation',
      'Delivery addresses — for shipping your orders',
      'Order history and transaction data',
      'Device information and IP address — for security',
      'Payment information — we do NOT store card numbers; all payments are processed securely by Razorpay',
    ],
  },
  {
    Icon: UserCheck,
    title: 'How We Use Your Information',
    color: 'green',
    items: [
      'To process and fulfill your orders',
      'To send order updates via WhatsApp and email',
      'To send OTP verification codes for login',
      'To improve our website and product offerings',
      'To send promotional offers (you can opt out anytime)',
      'To comply with legal requirements',
    ],
  },
  {
    Icon: Share2,
    title: 'Information Sharing',
    color: 'amber',
    items: [
      'Shipmozo (courier partner) — for order delivery',
      'Razorpay — for secure payment processing',
      'Google Analytics — for anonymised website analytics',
      'SMS/WhatsApp providers — for OTP and order notifications',
    ],
    note: 'We never sell your personal data. All third-party partners are bound by strict data-protection agreements.',
  },
  {
    Icon: Lock,
    title: 'Data Security',
    color: 'green',
    items: [
      'SSL/TLS encryption for all data transmission',
      'OTP-based authentication — no passwords stored on our servers',
      'Regular security audits of all systems',
      'Breach notification to affected users within 72 hours',
    ],
  },
  {
    Icon: Cookie,
    title: 'Cookies',
    color: 'orange',
    items: [
      'Keep you logged in across sessions',
      'Remember your cart items',
      'Understand how you use our website (analytics)',
    ],
    note: 'You can disable cookies in your browser settings, but this may affect login and cart functionality.',
  },
  {
    Icon: Shield,
    title: 'Your Rights',
    color: 'purple',
    items: [
      'Access your personal data — login and view your account',
      'Delete your account — contact us on WhatsApp',
      'Opt out of promotional messages at any time',
      'Request data correction at any time',
    ],
    note: 'Email us at info@shopatkjn.com for any data-related request.',
  },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   iconText: 'text-blue-600',   dot: 'bg-blue-400',   border: 'border-blue-100'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  iconText: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-100'  },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100',  iconText: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-100'  },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100', iconText: 'text-orange-600', dot: 'bg-orange-400', border: 'border-orange-100' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', iconText: 'text-purple-600', dot: 'bg-purple-400', border: 'border-purple-100' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-2 text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Privacy Policy</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">Privacy Policy</h1>
              <p className="text-green-200 text-sm mt-2">Last updated: January 2025 &middot; KJN Trading Company</p>
              <p className="text-white/70 text-sm mt-3 max-w-xl leading-relaxed">
                We respect your privacy and are committed to protecting your personal information.
                This policy explains what we collect, why we collect it, and how we keep it safe.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Quick summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🔒', label: 'SSL Encrypted', sub: 'All data in transit' },
            { icon: '🚫', label: 'Never Sold',    sub: 'Your data is yours' },
            { icon: '📱', label: 'OTP Login',     sub: 'No stored passwords' },
            { icon: '✉️', label: 'Opt-out',       sub: 'Any time, any channel' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl mb-1">{c.icon}</p>
              <p className="text-xs font-bold text-gray-800">{c.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Policy sections */}
        {SECTIONS.map((section, i) => {
          const c = colorMap[section.color];
          return (
            <div key={i} className={`bg-white rounded-2xl border ${c.border} shadow-sm overflow-hidden`}>
              <div className={`${c.bg} px-6 py-4 flex items-center gap-3 border-b ${c.border}`}>
                <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
                  <section.Icon className={`w-4.5 h-4.5 ${c.iconText}`} />
                </div>
                <h2 className="font-heading font-bold text-base text-gray-900">
                  <span className="text-gray-400 font-semibold mr-2">{String(i + 1).padStart(2, '0')}.</span>
                  {section.title}
                </h2>
              </div>
              <div className="px-6 py-5 space-y-2.5">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 flex-shrink-0`} />
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
                {section.note && (
                  <div className={`mt-3 ${c.bg} rounded-xl px-4 py-3 border ${c.border}`}>
                    <p className={`text-xs font-semibold ${c.iconText} leading-relaxed`}>{section.note}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Contact card */}
        <div className="bg-gradient-to-br from-primary-900 to-green-700 rounded-2xl p-6 text-white">
          <h3 className="font-heading font-bold text-lg mb-4">Privacy Queries?</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { Icon: Mail,   label: 'Email',     value: 'info@shopatkjn.com',         href: 'mailto:info@shopatkjn.com' },
              { Icon: Phone,  label: 'WhatsApp',  value: '+91 94406 58294',             href: 'https://wa.me/919440658294' },
              { Icon: MapPin, label: 'Address',   value: 'SY No 444/3, Mulakalacheruvu, AP 517390', href: null },
            ].map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3">
                <Icon className="w-4 h-4 text-green-300 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">{label}</p>
                  {href
                    ? <a href={href} className="text-xs font-semibold text-white hover:text-green-200 break-all transition-colors">{value}</a>
                    : <p className="text-xs text-white/80">{value}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related policies */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Related Policies</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Terms & Conditions', href: '/tos' },
              { label: 'Refund Policy',      href: '/refund-policy' },
              { label: 'Shipping Policy',    href: '/shipping-policy' },
              { label: 'Payment Policy',     href: '/payment-policy' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-lg text-xs font-semibold text-gray-600 hover:text-primary-900 transition-all">
                {l.label} <ChevronRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}