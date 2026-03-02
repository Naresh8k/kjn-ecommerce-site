'use client';
export const metadata = { title: 'Return & Refund Policy | KJN Shop' };

const sections = [
  {
    title: 'Return Eligibility',
    content: `You can return a product within 7 days of delivery if:
• The product received is damaged or defective
• Wrong product was delivered (different from what you ordered)
• Product is missing parts mentioned in the description

Products NOT eligible for return:
• Products that have been used or installed
• Products without original packaging
• Products damaged due to misuse or improper installation
• Electrical products once used (safety policy)`
  },
  {
    title: 'How to Initiate a Return',
    content: `1. Contact us on WhatsApp at 9440658294 within 7 days of delivery
2. Share your Order Number and reason for return
3. Attach photos/video clearly showing the defect or damage
4. Our team will review and respond within 24 hours
5. If approved, we will arrange a pickup from your address (free of charge)
6. Refund will be processed within 5-7 business days after we receive the product`
  },
  {
    title: 'Refund Process',
    content: `Refunds are processed to the original payment method:

• UPI/Card/Net Banking: Refund within 5-7 business days
• COD orders: Refund via bank transfer (NEFT) — provide account details when contacting us
• Razorpay Wallet: Refund within 2-3 business days

Once initiated, you will receive an email and WhatsApp confirmation of the refund.`
  },
  {
    title: 'Order Cancellation',
    content: `You can cancel your order anytime before it is shipped (status: Pending or Confirmed).

How to cancel:
• Go to My Account → Orders → Select Order → Cancel Order
• Or WhatsApp us at 9440658294 with your order number

Cancellation after shipment is not possible. If you refuse the delivery, return shipping charges may be deducted from your refund.

COD orders cancelled after dispatch: ₹50 return shipping charge applies.`
  },
  {
    title: 'Damaged in Transit',
    content: `If your product arrives damaged:
• Do NOT accept the delivery if packaging is clearly damaged — ask the courier to return it
• If you accepted it, take photos/video immediately before opening fully
• Contact us within 48 hours with photos
• We will arrange a full replacement or refund, no questions asked`
  },
  {
    title: 'Warranty Claims',
    content: `Many products come with manufacturer warranty. For warranty claims after 7 days of delivery, please contact the manufacturer directly. We can help facilitate warranty claims for defective products — contact us on WhatsApp with your order number and product details.`
  },
];

export default function RefundPolicyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: '#1B5E20', marginBottom: 8 }}>
        Return & Refund Policy
      </h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 40, borderBottom: '2px solid #E8F5E9', paddingBottom: 20 }}>
        Last updated: January 2025 · KJN Trading Company
      </p>

      <div style={{ background: '#FFF8E1', borderRadius: 12, padding: '16px 20px', marginBottom: 32, borderLeft: '4px solid #F59E0B' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>🕐 7-Day Return Window</p>
        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>Returns must be requested within 7 days of delivery date.</p>
      </div>

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
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>Need to return a product?</p>
        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>
          WhatsApp us at <a href="https://wa.me/919440658294" style={{ color: '#1B5E20', fontWeight: 700 }}>9440658294</a> with your order number and photos of the issue.
        </p>
      </div>
    </div>
  );
}