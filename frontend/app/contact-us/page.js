'use client';
import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you within 24 hours.');
      setForm({ name: '', email: '', phone: '', message: '' });
      setSending(false);
    }, 1500);
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', padding: '48px 0 40px', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 38px)', color: 'white', marginBottom: 10 }}>Contact Us</h1>
          <p style={{ opacity: 0.85, fontSize: 15 }}>We are here to help you with your farm equipment needs</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {/* Contact Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: Phone, title: 'Call Us', info: '9804599804', sub: 'Mon-Sat 9AM to 6PM', href: 'tel:9804599804', color: '#16A34A' },
              { icon: MessageCircle, title: 'WhatsApp', info: '9440658294', sub: 'Quick response on WhatsApp', href: 'https://wa.me/9440658294', color: '#25D366' },
              { icon: Mail, title: 'Email Us', info: 'info@shopatkjn.com', sub: 'Reply within 24 hours', href: 'mailto:info@shopatkjn.com', color: '#2563EB' },
              { icon: Clock, title: 'Business Hours', info: 'Mon - Sat', sub: '9:00 AM to 6:00 PM', color: '#FF6F00' },
            ].map(({ icon: Icon, title, info, sub, href, color }) => (
              <a key={title} href={href || '#'} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.25s', cursor: href ? 'pointer' : 'default' }}
                  onMouseOver={e => { if (href) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; } }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon style={{ width: 22, color }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 4 }}>{title}</p>
                  <p style={{ fontWeight: 800, fontSize: 14, color, marginBottom: 2 }}>{info}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Form */}
          <div style={{ background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Send us a Message</h2>
            <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 24 }}>Fill the form and we'll get back to you within 24 hours</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Full Name *</label>
                  <input className="input" placeholder="Your name" value={form.name} required
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Phone *</label>
                  <input className="input" placeholder="Mobile number" value={form.phone} required
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Email</label>
                <input className="input" type="email" placeholder="Your email (optional)" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Message *</label>
                <textarea className="input" placeholder="Tell us how we can help you..." value={form.message} required
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ minHeight: 120, resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={sending} className="btn btn-primary" style={{ fontSize: 15 }}>
                {sending ? 'Sending...' : <><Send style={{ width: 16 }} /> Send Message</>}
              </button>
            </form>
          </div>

          {/* Address */}
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <MapPin style={{ width: 24, color: '#1B5E20', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Our Location</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>
                  SY No 444/3, Near Bharat Petroleum,<br />
                  Kadiri Road, Mulakalacheruvu,<br />
                  Andhra Pradesh – 517390
                </p>
              </div>
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', height: 220 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3868.0!2d78.5!3d14.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzAwLjAiTiA3OMKwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%" height="220" style={{ border: 'none' }}
                allowFullScreen loading="lazy" title="KJN Shop Location" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}