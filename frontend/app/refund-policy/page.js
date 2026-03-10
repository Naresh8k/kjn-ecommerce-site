'use client';
import Link from 'next/link';
import {
  RotateCcw, CheckCircle, Clock, Truck,
  ShieldAlert, Wrench, ChevronRight, Phone, MessageCircle,
} from 'lucide-react';

const SECTIONS = [
  {
    Icon: CheckCircle,
    color: 'green',
    title: 'Return Eligibility',
    body: 'You can return a product within 7 days of delivery if:',
    items: [
      'The product received is damaged or defective',
      'Wrong product was delivered (different from what you ordered)',
      'Product is missing parts mentioned in the description',
    ],
    ineligible: {
      label: 'Products NOT eligible for return:',
      items: [
        'Products that have been used or installed',
        'Products without original packaging',
        'Products damaged due to misuse or improper installation',
        'Electrical products once used (safety policy)',
      ],
    },
  },
  {
    Icon: RotateCcw,
    color: 'blue',
    title: 'How to Initiate a Return',
    body: null,
    steps: [
      'Contact us on WhatsApp at 9440658294 within 7 days of delivery',
      'Share your Order Number and reason for return',
      'Attach photos or video clearly showing the defect or damage',
      'Our team reviews and responds within 24 hours',
      'If approved, we arrange a free pickup from your address',
      'Refund is processed within 5\u20137 business days after we receive the product',
    ],
  },
  {
    Icon: Clock,
    color: 'indigo',
    title: 'Refund Process',
    body: 'Refunds are processed to the original payment method:',
    items: [
      'UPI / Card / Net Banking \u2014 refund within 5\u20137 business days',
      'COD orders \u2014 refund via NEFT bank transfer (provide account details when contacting us)',
      'Razorpay Wallet \u2014 refund within 2\u20133 business days',
    ],
    note: 'You will receive a WhatsApp and email confirmation once the refund is initiated.',
  },
  {
    Icon: Truck,
    color: 'amber',
    title: 'Order Cancellation',
    body: 'You can cancel your order any time before it is shipped (status: Pending or Confirmed).',
    items: [
      'Go to My Account \u2192 Orders \u2192 Select Order \u2192 Cancel Order',
      'Or WhatsApp us at 9440658294 with your order number',
      'Cancellation after shipment is not possible',
      'Refused deliveries: return shipping charges may be deducted from refund',
      'COD orders cancelled after dispatch: \u20b950 return shipping charge applies',
    ],
  },
  {
    Icon: ShieldAlert,
    color: 'red',
    title: 'Damaged in Transit',
    body: null,
    items: [
      'Do NOT accept delivery if packaging is visibly damaged \u2014 ask the courier to return it',
      'If already accepted, photograph the damage immediately before fully opening',
      'Contact us within 48 hours with photos or video evidence',
      'We will arrange a full replacement or refund, no questions asked',
    ],
    highlight: true,
  },
  {
    Icon: Wrench,
    color: 'purple',
    title: 'Warranty Claims',
    body: 'Many products come with manufacturer warranty. For warranty claims after 7 days of delivery, please contact the manufacturer directly. We can help facilitate claims \u2014 contact us on WhatsApp with your order number and product details.',
    items: [],
  },
];

const colorMap = {
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  iconText: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-100',  noteText: 'text-green-700',  step: 'bg-green-500'  },
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   iconText: 'text-blue-600',   dot: 'bg-blue-400',   border: 'border-blue-100',   noteText: 'text-blue-700',   step: 'bg-blue-500'   },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100', iconText: 'text-indigo-600', dot: 'bg-indigo-400', border: 'border-indigo-100', noteText: 'text-indigo-700', step: 'bg-indigo-500' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100',  iconText: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-100',  noteText: 'text-amber-700',  step: 'bg-amber-500'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    iconText: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-100',    noteText: 'text-red-700',    step: 'bg-red-500'    },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', iconText: 'text-purple-600', dot: 'bg-purple-400', border: 'border-purple-100', noteText: 'text-purple-700', step: 'bg-purple-500' },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-2 text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Return &amp; Refund Policy</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">Return &amp; Refund Policy</h1>
              <p className="text-green-200 text-sm mt-2">Last updated: January 2025 &middot; KJN Trading Company</p>
              <p className="text-white/70 text-sm mt-3 max-w-xl leading-relaxed">
                We want you to be 100% satisfied. If something is wrong, we&apos;ll make it right.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* 7-day alert */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-2xl px-5 py-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">7-Day Return Window</p>
            <p className="text-xs text-amber-700 mt-0.5">All return requests must be raised within 7 days of the delivery date.</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '📅', label: '7-Day Window',    sub: 'From delivery date' },
            { icon: '🚚', label: 'Free Pickup',      sub: 'We arrange returns' },
            { icon: '💸', label: '5-7 Days Refund',  sub: 'To original method' },
            { icon: '📱', label: 'WhatsApp First',   sub: 'Quick resolution' },
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

                {section.steps && (
                  <ol className="space-y-2.5">
                    {section.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className={`w-5 h-5 rounded-full ${c.step} text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5`}>{j + 1}</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                )}

                {section.items && section.items.length > 0 && (
                  <div className={section.highlight ? `${c.bg} rounded-xl p-4 border ${c.border} space-y-2` : 'space-y-2'}>
                    {section.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 flex-shrink-0`} />
                        <p className={`text-sm leading-relaxed ${section.highlight ? c.iconText : 'text-gray-700'}`}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}

                {section.ineligible && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100 space-y-2 mt-2">
                    <p className="text-xs font-bold text-red-700 mb-2">{section.ineligible.label}</p>
                    {section.ineligible.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        <p className="text-sm text-red-700 leading-relaxed">{item}</p>
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

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary-900 to-green-700 rounded-2xl p-6 text-white">
          <h3 className="font-heading font-bold text-lg mb-2">Need to Return a Product?</h3>
          <p className="text-white/70 text-sm mb-4">Contact us on WhatsApp with your order number and photos of the issue.</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://wa.me/919440658294"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp: 9440658294
            </a>
            <a href="tel:+919440658294"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
              <Phone className="w-4 h-4" /> Call Us
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