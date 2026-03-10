'use client';
import Link from 'next/link';
import {
  Truck, Package, MapPin, Clock,
  Zap, AlertCircle, ChevronRight, Phone, ExternalLink,
} from 'lucide-react';

const SECTIONS = [
  {
    Icon: Truck,
    color: 'blue',
    title: 'Shipping Partners',
    body: 'We ship across India through Shipmozo, our logistics partner, who works with multiple courier companies:',
    items: ['Delhivery', 'Ekart', 'Xpressbees', 'DTDC', 'Blue Dart (for high-value orders)'],
    note: 'The courier is automatically selected based on your pincode and order weight for the fastest delivery.',
  },
  {
    Icon: Package,
    color: 'green',
    title: 'Shipping Charges',
    body: null,
    items: [
      'Orders above \u20b9500 \u2014 FREE shipping',
      'Orders below \u20b9500 \u2014 \u20b949 flat shipping charge (applied at checkout)',
      'Bulky/heavy items (>5 kg) \u2014 additional charges shown at checkout',
    ],
    note: 'COD orders carry an additional \u20b930 COD handling charge.',
  },
  {
    Icon: Clock,
    color: 'indigo',
    title: 'Delivery Timeframes',
    body: 'Standard delivery times after order dispatch:',
    regions: [
      { region: 'Andhra Pradesh & Telangana', time: '1\u20133 business days' },
      { region: 'South India (Karnataka, Tamil Nadu, Kerala)', time: '2\u20134 business days' },
      { region: 'West India (Maharashtra, Gujarat)', time: '3\u20135 business days' },
      { region: 'North India (Delhi, UP, Rajasthan)', time: '4\u20136 business days' },
      { region: 'Northeast & Remote Areas', time: '5\u20138 business days' },
    ],
    note: 'These are estimates. Actual delivery may vary due to weather, public holidays, or courier delays.',
  },
  {
    Icon: Zap,
    color: 'amber',
    title: 'Order Processing',
    body: null,
    items: [
      'Orders placed before 2 PM on business days are dispatched the same day',
      'Orders placed after 2 PM or on weekends are dispatched the next business day',
      'You will receive a WhatsApp message with your AWB tracking number once dispatched',
    ],
  },
  {
    Icon: MapPin,
    color: 'purple',
    title: 'Serviceable Pincodes',
    body: 'We deliver to 25,000+ pincodes across India. Use the pincode checker on the product page before placing your order.',
    items: [],
    note: 'If your pincode is not serviceable, contact us on WhatsApp \u2014 we can sometimes arrange special delivery for large orders.',
  },
  {
    Icon: AlertCircle,
    color: 'red',
    title: 'Delayed or Missing Shipments',
    body: 'If your order hasn\'t arrived within the expected timeframe:',
    steps: [
      'Check your tracking via the link sent on WhatsApp',
      'If tracking shows delivered but you didn\'t receive it, contact us within 48 hours',
      'WhatsApp us at 9440658294 with your order number',
      'We will follow up with the courier and resolve within 3\u20135 business days',
    ],
  },
];

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   iconText: 'text-blue-600',   dot: 'bg-blue-400',   border: 'border-blue-100',   step: 'bg-blue-500',   noteText: 'text-blue-700',   regionBg: 'bg-blue-50',   regionText: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  iconText: 'text-green-700',  dot: 'bg-green-500',  border: 'border-green-100',  step: 'bg-green-500',  noteText: 'text-green-700',  regionBg: 'bg-green-50',  regionText: 'text-green-700'  },
  indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100', iconText: 'text-indigo-600', dot: 'bg-indigo-400', border: 'border-indigo-100', step: 'bg-indigo-500', noteText: 'text-indigo-700', regionBg: 'bg-indigo-50', regionText: 'text-indigo-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100',  iconText: 'text-amber-700',  dot: 'bg-amber-400',  border: 'border-amber-100',  step: 'bg-amber-500',  noteText: 'text-amber-700',  regionBg: 'bg-amber-50',  regionText: 'text-amber-700'  },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', iconText: 'text-purple-600', dot: 'bg-purple-400', border: 'border-purple-100', step: 'bg-purple-500', noteText: 'text-purple-700', regionBg: 'bg-purple-50', regionText: 'text-purple-700' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    iconText: 'text-red-600',    dot: 'bg-red-400',    border: 'border-red-100',    step: 'bg-red-500',    noteText: 'text-red-700',    regionBg: 'bg-red-50',    regionText: 'text-red-700'    },
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex items-center gap-2 text-green-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span>Shipping Policy</span>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">Shipping Policy</h1>
              <p className="text-green-200 text-sm mt-2">Last updated: January 2025 &middot; KJN Trading Company</p>
              <p className="text-white/70 text-sm mt-3 max-w-xl leading-relaxed">
                Fast, reliable delivery to 25,000+ pincodes across India via Shipmozo logistics.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Quick highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🚚', label: 'Free Shipping',      sub: 'Orders above \u20b9500' },
            { icon: '\u26a1', label: 'Same-Day Dispatch', sub: 'Orders before 2 PM' },
            { icon: '\ud83d\udce6', label: '25,000+ Pincodes',  sub: 'Pan India delivery' },
            { icon: '\ud83d\udcf1', label: 'WhatsApp Tracking',  sub: 'AWB sent on dispatch' },
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

                {section.regions && (
                  <div className="divide-y divide-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    {section.regions.map((r, j) => (
                      <div key={j} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-700">{r.region}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.bg} ${c.iconText}`}>{r.time}</span>
                      </div>
                    ))}
                  </div>
                )}

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

        {/* Track order CTA */}
        <div className="bg-gradient-to-br from-primary-900 to-green-700 rounded-2xl p-6 text-white">
          <h3 className="font-heading font-bold text-lg mb-2">Track Your Order</h3>
          <p className="text-white/70 text-sm mb-4">Check live shipment status or reach us directly.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/orders"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
              <Package className="w-4 h-4" /> My Orders
            </Link>
            <a href="https://panel.shipmozo.com/track-order/gEe8sXriwWhDtNy9KVAS" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
              <ExternalLink className="w-4 h-4" /> Shipmozo Tracking
            </a>
            <a href="https://wa.me/919440658294"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors">
              <Phone className="w-4 h-4" /> WhatsApp
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