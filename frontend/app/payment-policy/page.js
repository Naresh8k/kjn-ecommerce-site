'use client';
// ─────────────────────────────────────────────────────────────
// src/app/payment-policy/page.js
// Copy this file for all policy pages, change content only
// Also create: privacy-policy, refund-policy, shipping-policy, tos
// ─────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Payment Policy | KJN Shop',
};

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

export default function PaymentPolicyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: '#1B5E20', marginBottom: 8 }}>
        Payment Policy
      </h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 40, borderBottom: '2px solid #E8F5E9', paddingBottom: 20 }}>
        Last updated: January 2025 · KJN Trading Company
      </p>

      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, color: '#1F2937', marginBottom: 12 }}>
            {i + 1}. {s.title}
          </h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
            {s.content}
          </p>
        </div>
      ))}

      <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '20px', marginTop: 40 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>Questions about payments?</p>
        <p style={{ fontSize: 13, color: '#374151' }}>
          WhatsApp: <a href="https://wa.me/919440658294" style={{ color: '#1B5E20', fontWeight: 700 }}>9440658294</a> ·
          Email: <a href="mailto:info@shopatkjn.com" style={{ color: '#1B5E20', fontWeight: 700 }}>info@shopatkjn.com</a>
        </p>
      </div>
    </div>
  );
}