'use client';
export const metadata = { title: 'Shipping Policy | KJN Shop' };

const sections = [
  {
    title: 'Shipping Partners',
    content: `We ship across India through Shipmozo, our logistics partner, who works with multiple courier companies including:
• Delhivery
• Ekart
• Xpressbees
• DTDC
• Blue Dart (for high-value orders)

The courier is automatically selected based on your pincode and order weight for fastest delivery.`
  },
  {
    title: 'Shipping Charges',
    content: `• Orders above ₹500: FREE shipping
• Orders below ₹500: ₹49 flat shipping charge (applied at checkout)
• Bulky/heavy items (>5 kg): Additional charges may apply and will be shown at checkout

Note: COD orders may have an additional ₹30 COD handling charge.`
  },
  {
    title: 'Delivery Timeframes',
    content: `Standard delivery times after order dispatch:

• Andhra Pradesh & Telangana: 1-3 business days
• South India (Karnataka, Tamil Nadu, Kerala): 2-4 business days  
• West India (Maharashtra, Gujarat): 3-5 business days
• North India (Delhi, UP, Rajasthan): 4-6 business days
• Northeast & Remote Areas: 5-8 business days

These are estimates. Actual delivery may vary due to weather, holidays, or courier delays.`
  },
  {
    title: 'Order Processing',
    content: `• Orders placed before 2 PM on business days are dispatched the same day
• Orders placed after 2 PM or on weekends are dispatched the next business day
• You will receive a WhatsApp message with your AWB tracking number once dispatched
• Track your shipment at: https://panel.shipmozo.com/track-order/gEe8sXriwWhDtNy9KVAS`
  },
  {
    title: 'Serviceable Pincodes',
    content: `We deliver to 25,000+ pincodes across India. To check if we deliver to your pincode, use the pincode checker on the product page before placing your order.

If your pincode is not serviceable, contact us on WhatsApp — we can sometimes arrange special delivery for large orders.`
  },
  {
    title: 'Delayed or Missing Shipments',
    content: `If your order hasn't arrived within the expected timeframe:
1. Check your tracking via the link sent on WhatsApp
2. If tracking shows delivered but you didn't receive it, contact us within 48 hours
3. WhatsApp us at 9440658294 with your order number

We will follow up with the courier and resolve within 3-5 business days.`
  },
];

export default function ShippingPolicyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: '#1B5E20', marginBottom: 8 }}>
        Shipping Policy
      </h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 40, borderBottom: '2px solid #E8F5E9', paddingBottom: 20 }}>
        Last updated: January 2025 · KJN Trading Company
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { icon: '🚚', label: 'Free Shipping', sub: 'Orders above ₹500' },
          { icon: '⚡', label: 'Same Day Dispatch', sub: 'Orders before 2 PM' },
          { icon: '📦', label: '25,000+ Pincodes', sub: 'Pan India delivery' },
          { icon: '📱', label: 'WhatsApp Tracking', sub: 'AWB sent on dispatch' },
        ].map(({ icon, label, sub }) => (
          <div key={label} style={{ background: '#E8F5E9', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>{icon}</div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#1B5E20', margin: '8px 0 2px' }}>{label}</p>
            <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, color: '#1F2937', marginBottom: 12 }}>
            {i + 1}. {s.title}
          </h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
        </div>
      ))}

      <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '20px', marginTop: 40 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>Track Your Order</p>
        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
          Login and go to <a href="/orders" style={{ color: '#1B5E20', fontWeight: 700 }}>My Orders</a> · Or WhatsApp <a href="https://wa.me/919440658294" style={{ color: '#1B5E20', fontWeight: 700 }}>9440658294</a>
        </p>
      </div>
    </div>
  );
}