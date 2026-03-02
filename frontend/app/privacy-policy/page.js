'use client';
// ─────────────────────────────────────────────────────────
// src/app/privacy-policy/page.js
// ─────────────────────────────────────────────────────────
export const metadata = { title: 'Privacy Policy | KJN Shop' };

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: '#1B5E20', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 40, borderBottom: '2px solid #E8F5E9', paddingBottom: 20 }}>Last updated: January 2025 · KJN Trading Company</p>

      {[
        { title: 'Information We Collect', content: `When you use KJN Shop, we collect:\n• Name, phone number, and email address (for account creation)\n• Delivery addresses (for shipping your orders)\n• Order history and transaction data\n• Device information and IP address (for security)\n• Payment information — we do NOT store card numbers; all payments are processed by Razorpay` },
        { title: 'How We Use Your Information', content: `• To process and fulfill your orders\n• To send order updates via WhatsApp and email\n• To send OTP verification codes for login\n• To improve our website and product offerings\n• To send promotional offers (you can opt out anytime)\n• To comply with legal requirements` },
        { title: 'Information Sharing', content: `We do NOT sell your personal information. We share data only with:\n• Shipmozo (courier partner) — for delivery\n• Razorpay — for payment processing\n• Google Analytics — for website analytics (anonymized)\n• SMS/WhatsApp providers — for OTP and order notifications\n\nAll third parties are bound by strict data protection agreements.` },
        { title: 'Data Security', content: `We use SSL/TLS encryption for all data transmission. Your account is protected by OTP-based authentication (no stored passwords). We regularly audit our systems for security vulnerabilities. In the event of a data breach, we will notify affected users within 72 hours.` },
        { title: 'Cookies', content: `We use cookies to:\n• Keep you logged in across sessions\n• Remember your cart items\n• Understand how you use our website\n\nYou can disable cookies in your browser settings, but this may affect login functionality.` },
        { title: 'Your Rights', content: `You have the right to:\n• Access your personal data (login and view account)\n• Delete your account (contact us on WhatsApp)\n• Opt out of promotional messages\n• Request data correction at any time\n\nContact us at info@shopatkjn.com for any data-related requests.` },
        { title: 'Contact for Privacy', content: `For privacy-related queries:\nEmail: info@shopatkjn.com\nWhatsApp: 9440658294\nAddress: KJN Trading Company, SY No 444/3, Mulakalacheruvu, Andhra Pradesh 517390` },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17, color: '#1F2937', marginBottom: 10 }}>{i + 1}. {s.title}</h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
        </div>
      ))}
    </div>
  );
}