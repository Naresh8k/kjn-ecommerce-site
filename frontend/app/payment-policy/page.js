'use client';
import Link from 'next/link';
import {
  CreditCard, Shield, Receipt, AlertCircle,
  Smartphone, Percent, ChevronRight, Phone, Mail,
} from 'lucide-react';

const SECTIONS = [
  {
    Icon: CreditCard,
    color: 'blue',
    title: 'Accepted Payment Methods',
    body: 'We accept the following methods through our secure Razorpay payment gateway:',
    methods: [
      { icon: '\ud83d\udcf1', label: 'UPI',          sub: 'Google Pay, PhonePe, Paytm, BHIM' },
      { icon: '\ud83d\udcb3', label: 'Credit Cards', sub: 'Visa, Mastercard, Rupay, Amex' },
      { icon: '\ud83c\udfe6', label: 'Debit Cards',  sub: 'All Indian banks' },
      { icon: '\ud83d\udcbb', label: 'Net Banking',  sub: '50+ supported banks' },
      { icon: '\ud83d\udcb5', label: 'Cash on Delivery', sub: 'Available for orders under \u20b910,000' },
    ],
  },
  {
    Icon: Percent,
    color: 'green',
    title: 'Prepaid Discount',
    body: 'Get 1.5% instant discount on all prepaid orders (online payments via Razorpay). The discount is applied automatically at checkout when you select any online payment method.',
    items: [],
    note: 'COD orders are not eligible for the prepaid discount.',
  },
  {
    Icon: Shield,
    color: 'indigo',
    title: 'Payment Security',
    body: null,
    items: [
      'All payments are processed through Razorpay \u2014 a PCI DSS Level 1 compliant gateway',
      'Your card details are never stored on our servers',
      'All transactions are encrypted using SSL/TLS technology',
      'We will never call you asking for OTPs, card numbers, or CVV details',
    ],
  },
  {
    Icon: Receipt,
    color: 'amber',
    title: 'GST & Invoicing',
    body: null,
    items: [
      'GST is included in the displayed price for all products',
      'A GST invoice is automatically generated for every order',
      'Download your invoice from My Account \u2192 Order Details',
    ],
    note: 'GSTIN: 37CMMPK7267H1ZG \u2014 KJN Trading Company',
  },
  {
    Icon: AlertCircle,
    color: 'red',
    title: 'Payment Failure',
    body: 'If your payment fails:',
    items: [
      'Your money will not be deducted. If it was, it will be refunded automatically within 5\u20137 business days',
      'Try refreshing and placing the order again with a different payment method',
      'For persistent issues, contact us on WhatsApp at 9440658294',
    ],
  },
  {
    Icon: Smartphone,
    color: 'purple',
    title: 'COD Policy',
    body: null,
    items: [
      'Cash on Delivery is available for select pincodes and orders under \u20b910,000',
      'Please keep exact change ready at the time of delivery',
      'Our delivery partner cannot provide change',
      'COD orders refused or undelivered 3 times may result in COD being disabled for your account',
    ],
  },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   iconText: 'text-blue-600',   dot: 'bg-blue-400',   border: 'border-blue-100',   noteText: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  iconText: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-100',  noteText: 'text-green-700'  },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100', iconText: 'text-indigo-600', dot: 'bg-indigo-400', border: 'border-indigo-100', noteText: 'text-indigo-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100',  iconText: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-100',  noteText: 'text-amber-700'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    iconText: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-100',    noteText: 'text-red-700'    },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', iconText: 'text-purple-600', dot: 'bg-purple-400', border: 'border-purple-100', noteText: 'text-purple-700' },
};

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-2 text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Payment Policy</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">Payment Policy</h1>
              <p className="text-green-200 text-sm mt-2">Last updated: January 2025 &middot; KJN Trading Company</p>
              <p className="text-white/70 text-sm mt-3 max-w-xl leading-relaxed">
                Secure, flexible payment options for every farmer. Powered by Razorpay.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '\ud83d\udcb3', label: '5 Pay Methods',    sub: 'UPI, Card, COD & more' },
            { icon: '\ud83d\udd12', label: 'PCI DSS Secure',   sub: 'Via Razorpay gateway' },
            { icon: '\ud83c\udff7\ufe0f', label: '1.5% Prepaid Disc.', sub: 'On all online orders' },
            { icon: '\ud83e\uddfe', label: 'GST Invoice',       sub: 'Auto-generated always' },
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
              <div className="px-6 py-5 space-y-3">
                {section.body && <p className="text-sm text-gray-700 leading-relaxed">{section.body}</p>}

                {section.methods && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {section.methods.map((m, j) => (
                      <div key={j} className={`flex items-center gap-3 ${c.bg} rounded-xl px-4 py-3 border ${c.border}`}>
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <p className={`text-sm font-bold ${c.iconText}`}>{m.label}</p>
                          <p className="text-[11px] text-gray-500">{m.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.items && section.items.length > 0 && (
                  <div className="space-y-2">
                    {section.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 flex-shrink-0`} />
                        <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                )}

                {section.note && (
                  <div className={`${c.bg} rounded-xl px-4 py-3 border ${c.border}`}>
                    <p className={`text-xs font-semibold ${c.noteText} leading-relaxed`}>{section.note}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-primary-900 to-green-700 rounded-2xl p-6 text-white">
          <h3 className="font-heading font-bold text-lg mb-2">Payment Questions?</h3>
          <p className="text-white/70 text-sm mb-4">Our support team is available to help with any payment issues.</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://wa.me/919440658294"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
              <Phone className="w-4 h-4" /> WhatsApp: 9440658294
            </a>
            <a href="mailto:info@shopatkjn.com"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
              <Mail className="w-4 h-4" /> info@shopatkjn.com
            </a>
          </div>
        </div>

        {/* Related policies */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Related Policies</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Terms & Conditions', href: '/tos' },
              { label: 'Privacy Policy',     href: '/privacy-policy' },
              { label: 'Refund Policy',      href: '/refund-policy' },
              { label: 'Shipping Policy',    href: '/shipping-policy' },
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

const sections = [
  {
    title: 'Accepted Payment Methods',
    content: `We accept the following payment methods through our secure Razorpay payment gateway:
• UPI (Google Pay, PhonePe, Paytm, BHIM)
• Credit Cards (Visa, Mastercard, Rupay, Amex)
• Debit Cards (all Indian banks)
• Net Banking (50+ banks)
• Cash on Delivery (COD) — available for orders under ₹10,000`
  },
  {
    title: 'Prepaid Discount',
    content: `Get 1.5% instant discount on all prepaid orders (online payments via Razorpay). This discount is applied automatically at checkout when you choose any online payment method.

COD orders are not eligible for this discount.`
  },
  {
    title: 'Payment Security',
    content: `All payments are processed through Razorpay, a PCI DSS compliant payment gateway. Your card details are never stored on our servers. All transactions are encrypted using SSL/TLS technology.

We never call you asking for OTPs, card numbers, or CVV details.`
  },
  {
    title: 'GST & Invoicing',
    content: `GST (Goods and Services Tax) is included in the displayed price for all products. A GST invoice is automatically generated for every order and is available in your account under Order Details.

GSTIN: 37CMMPK7267H1ZG (KJN Trading Company)`
  },
  {
    title: 'Payment Failure',
    content: `If your payment fails:
• Your money will not be deducted. If it was, it will be refunded automatically within 5-7 business days.
• Try refreshing and placing the order again with a different payment method.
• For persistent issues, contact us on WhatsApp at 9440658294.`
  },
  {
    title: 'COD Policy',
    content: `Cash on Delivery is available for select pincodes and orders under ₹10,000. Please keep exact change ready at the time of delivery. Our delivery partner cannot provide change.

COD orders that are refused or undelivered 3 times may result in COD option being disabled for your account.`
  },
];
