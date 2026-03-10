'use client';
import Link from 'next/link';
import {
  FileText, ShoppingBag, ClipboardList, User,
  Ban, AlertTriangle, Scale, RefreshCw,
  ChevronRight, Mail, Phone,
} from 'lucide-react';

const SECTIONS = [
  {
    Icon: ClipboardList,
    color: 'blue',
    title: 'Acceptance of Terms',
    body: 'By accessing or using www.shopatkjn.com, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree, please discontinue using our platform. These terms apply to all visitors, users, and customers.',
    items: [],
  },
  {
    Icon: ShoppingBag,
    color: 'green',
    title: 'Products & Pricing',
    body: null,
    items: [
      'All prices are in Indian Rupees (\u20b9) and include applicable GST',
      'We reserve the right to change prices without prior notice',
      'Product images are for illustrative purposes; actual product may vary slightly',
      'We make every effort to ensure descriptions are accurate, but errors may occur',
      'In case of pricing errors, we will contact you before processing your order',
    ],
  },
  {
    Icon: FileText,
    color: 'indigo',
    title: 'Orders & Contracts',
    body: null,
    items: [
      'Placing an order constitutes an offer to purchase',
      'Order confirmation via email or WhatsApp signals acceptance of your order',
      'We reserve the right to cancel any order at our discretion with a full refund',
      'Orders are subject to product availability at the time of purchase',
    ],
  },
  {
    Icon: User,
    color: 'purple',
    title: 'User Accounts',
    body: null,
    items: [
      'You must provide accurate and complete information when registering',
      'You are responsible for maintaining the confidentiality of your account',
      'One account per person or business entity',
      'We reserve the right to suspend accounts for fraudulent or suspicious activity',
      'You must be 18 years or older to create an account and place orders',
    ],
  },
  {
    Icon: Ban,
    color: 'red',
    title: 'Prohibited Activities',
    body: 'You agree not to engage in any of the following:',
    items: [
      'Placing fraudulent orders or providing false delivery information',
      'Abusing our return, refund, or COD policies repeatedly',
      'Using bots, scrapers, or automated tools to access our website',
      'Reselling our products commercially without prior written consent',
      'Attempting to hack, disrupt, or damage our platform or servers',
      'Impersonating another user or KJN staff',
    ],
    highlight: true,
  },
  {
    Icon: AlertTriangle,
    color: 'amber',
    title: 'Limitation of Liability',
    body: 'KJN Trading Company is not liable for:',
    items: [
      'Indirect, incidental, or consequential damages',
      'Loss of profits arising from use or non-availability of our products',
      'Delays caused by courier partners, weather conditions, or natural disasters',
      'Product defects covered under manufacturer warranty',
    ],
    note: 'Our total liability in any dispute is limited to the amount paid for the specific product in question.',
  },
  {
    Icon: Scale,
    color: 'gray',
    title: 'Governing Law',
    body: 'These Terms are governed by the laws of the Republic of India. Any disputes arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the courts in Chittoor District, Andhra Pradesh, India.',
    items: [],
  },
  {
    Icon: RefreshCw,
    color: 'teal',
    title: 'Changes to Terms',
    body: 'We may update these terms at any time. Continued use of our website after changes constitutes acceptance of the revised terms. We will notify registered users of significant changes via WhatsApp or email.',
    items: [],
  },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   iconText: 'text-blue-600',   dot: 'bg-blue-400',   border: 'border-blue-100',   noteBg: 'bg-blue-50',   noteText: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  iconText: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-100',  noteBg: 'bg-green-50',  noteText: 'text-green-700'  },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100', iconText: 'text-indigo-600', dot: 'bg-indigo-400', border: 'border-indigo-100', noteBg: 'bg-indigo-50', noteText: 'text-indigo-700' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', iconText: 'text-purple-600', dot: 'bg-purple-400', border: 'border-purple-100', noteBg: 'bg-purple-50', noteText: 'text-purple-700' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    iconText: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-100',    noteBg: 'bg-red-50',    noteText: 'text-red-700'    },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100',  iconText: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-100',  noteBg: 'bg-amber-50',  noteText: 'text-amber-700'  },
  gray:   { bg: 'bg-gray-50',   icon: 'bg-gray-100',   iconText: 'text-gray-500',   dot: 'bg-gray-400',   border: 'border-gray-100',   noteBg: 'bg-gray-50',   noteText: 'text-gray-600'   },
  teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-100',   iconText: 'text-teal-600',   dot: 'bg-teal-400',   border: 'border-teal-100',   noteBg: 'bg-teal-50',   noteText: 'text-teal-700'   },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-2 text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Terms &amp; Conditions</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">Terms &amp; Conditions</h1>
              <p className="text-green-200 text-sm mt-2">
                Last updated: January 2025 &middot; KJN Trading Company
                <span className="ml-2 px-2 py-0.5 bg-white/15 rounded text-[10px] font-bold uppercase tracking-wider">
                  GSTIN: 37CMMPK7267H1ZG
                </span>
              </p>
              <p className="text-white/70 text-sm mt-3 max-w-xl leading-relaxed">
                Please read these terms carefully before using our platform. By continuing, you agree to these conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Quick highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🇮🇳', label: 'Indian Law',        sub: 'Governed by Indian courts' },
            { icon: '🔞', label: '18+ Only',            sub: 'Age requirement applies' },
            { icon: '📜', label: 'GST Compliant',       sub: 'GSTIN: 37CMMPK7267H1ZG' },
            { icon: '⚖️', label: 'Chittoor Courts',     sub: 'Jurisdiction for disputes' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl mb-1">{c.icon}</p>
              <p className="text-xs font-bold text-gray-800">{c.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Terms sections */}
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
              <div className="px-6 py-5 space-y-3">
                {section.body && (
                  <p className="text-sm text-gray-700 leading-relaxed">{section.body}</p>
                )}
                {section.items.length > 0 && (
                  <div className={`space-y-2 ${section.highlight ? `${c.bg} rounded-xl p-4 border ${c.border}` : ''}`}>
                    {section.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 flex-shrink-0`} />
                        <p className={`text-sm leading-relaxed ${section.highlight ? c.iconText : 'text-gray-700'}`}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {section.note && (
                  <div className={`${c.noteBg} rounded-xl px-4 py-3 border ${c.border}`}>
                    <p className={`text-xs font-semibold ${c.noteText} leading-relaxed`}>{section.note}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Contact card */}
        <div className="bg-gradient-to-br from-primary-900 to-green-700 rounded-2xl p-6 text-white">
          <h3 className="font-heading font-bold text-lg mb-4">Questions About These Terms?</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { Icon: Mail,  label: 'Email',    value: 'info@shopatkjn.com',  href: 'mailto:info@shopatkjn.com' },
              { Icon: Phone, label: 'WhatsApp', value: '+91 94406 58294',      href: 'https://wa.me/919440658294' },
            ].map(({ Icon, label, value, href }) => (
              <a key={label} href={href}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors">
                <Icon className="w-4 h-4 text-green-300 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Related policies */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Related Policies</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Privacy Policy',  href: '/privacy-policy' },
              { label: 'Refund Policy',   href: '/refund-policy' },
              { label: 'Shipping Policy', href: '/shipping-policy' },
              { label: 'Payment Policy',  href: '/payment-policy' },
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