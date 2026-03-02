'use client';
export const metadata = { title: 'Terms & Conditions | KJN Shop' };

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: '#1B5E20', marginBottom: 8 }}>Terms & Conditions</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 40, borderBottom: '2px solid #E8F5E9', paddingBottom: 20 }}>Last updated: January 2025 · KJN Trading Company (GSTIN: 37CMMPK7267H1ZG)</p>

      {[
        { title: 'Acceptance of Terms', content: 'By using www.shopatkjn.com, you agree to these Terms & Conditions. If you do not agree, please do not use our platform. These terms apply to all visitors, users, and customers.' },
        { title: 'Products & Pricing', content: `• All prices are in Indian Rupees (₹) and include GST\n• We reserve the right to change prices without prior notice\n• Product images are for illustrative purposes; actual product may vary slightly\n• We make every effort to ensure product descriptions are accurate, but errors may occur\n• In case of pricing errors, we will contact you before processing your order` },
        { title: 'Orders & Contracts', content: `• Placing an order constitutes an offer to purchase\n• Order confirmation email/WhatsApp confirms acceptance of your order\n• We reserve the right to cancel any order at our discretion with a full refund\n• Orders are subject to product availability` },
        { title: 'User Accounts', content: `• You must provide accurate information when creating an account\n• You are responsible for maintaining the confidentiality of your account\n• One account per person/business\n• We reserve the right to suspend accounts for fraudulent activity\n• You must be 18 years or older to create an account` },
        { title: 'Prohibited Activities', content: `You agree NOT to:\n• Place fraudulent orders\n• Provide false delivery addresses to delay or avoid payment\n• Abuse our return/refund policy\n• Use bots or automated tools to access our website\n• Resell our products without prior written permission\n• Attempt to hack, disrupt, or damage our platform` },
        { title: 'Limitation of Liability', content: `KJN Trading Company is not liable for:\n• Indirect, incidental, or consequential damages\n• Loss of profits arising from use of our products\n• Delays caused by courier partners or weather conditions\n• Product defects covered under manufacturer warranty (contact manufacturer directly)\n\nOur total liability is limited to the amount paid for the specific product in question.` },
        { title: 'Governing Law', content: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chittoor District, Andhra Pradesh, India.' },
        { title: 'Changes to Terms', content: 'We may update these terms at any time. Continued use of our website after changes constitutes acceptance. We will notify users of significant changes via WhatsApp or email.' },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, color: '#1F2937', marginBottom: 10 }}>{i + 1}. {s.title}</h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
        </div>
      ))}
      <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '16px 20px', marginTop: 32 }}>
        <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>Questions about these terms? Email us at <a href="mailto:info@shopatkjn.com" style={{ color: '#1B5E20', fontWeight: 700 }}>info@shopatkjn.com</a></p>
      </div>
    </div>
  );
}