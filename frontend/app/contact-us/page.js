'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

/* ── field-level validation ─────────────────────────────────── */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!form.phone.trim()) errors.phone = 'Phone is required';
  else if (form.phone.length !== 10) errors.phone = 'Enter a valid 10-digit mobile number';

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Enter a valid email address';

  if (!form.message.trim()) errors.message = 'Message is required';
  else if (form.message.trim().length < 15) errors.message = 'Message must be at least 15 characters';

  return errors;
}

/* ── Input field with inline error ─────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

const PAGE_CSS = `
  @keyframes orb-drift-a{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-18px)}}
  @keyframes orb-drift-b{0%,100%{transform:translate(0,0)}50%{transform:translate(-14px,16px)}}
  @keyframes hero-fade{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-ring{0%{transform:scale(1);opacity:.6}70%{transform:scale(1.4);opacity:0}100%{transform:scale(1.4);opacity:0}}
  @keyframes float-in{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  .hero-t1{animation:hero-fade .55s cubic-bezier(.22,1,.36,1) .05s both}
  .hero-t2{animation:hero-fade .55s cubic-bezier(.22,1,.36,1) .2s both}
  .hero-t3{animation:hero-fade .55s cubic-bezier(.22,1,.36,1) .35s both}
  .orb-a{animation:orb-drift-a 14s ease-in-out infinite}
  .orb-b{animation:orb-drift-b 18s ease-in-out infinite}
  .pulse-ring::before{content:'';position:absolute;inset:0;border-radius:50%;background:currentColor;animation:pulse-ring 2s ease infinite}
  .card-float{opacity:0;animation:float-in .55s cubic-bezier(.22,1,.36,1) forwards}
`;

const CONTACT_CARDS = [
  {
    Icon: Phone,
    title: 'Call Us',
    info: '9804599804',
    sub: 'Mon–Sat · 9 AM to 6 PM',
    href: 'tel:9804599804',
    color: '#16A34A',
    bg: '#DCFCE7',
    pulse: true,
    cta: 'Call Now',
  },
  {
    Icon: MessageCircle,
    title: 'WhatsApp',
    info: '9440658294',
    sub: 'Quick response guaranteed',
    href: 'https://wa.me/9440658294?text=Hi, I need help with your products',
    color: '#25D366',
    bg: '#D1FAE5',
    pulse: false,
    cta: 'Chat Now',
  },
  {
    Icon: Mail,
    title: 'Email Us',
    info: 'info@shopatkjn.com',
    sub: 'Reply within 24 hours',
    href: 'mailto:info@shopatkjn.com',
    color: '#2563EB',
    bg: '#DBEAFE',
    pulse: false,
    cta: 'Send Email',
  },
  {
    Icon: Clock,
    title: 'Business Hours',
    info: 'Mon – Sat',
    sub: '9:00 AM to 6:00 PM',
    href: null,
    color: '#D97706',
    bg: '#FEF3C7',
    pulse: false,
    cta: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef(null);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (touched[key]) {
      const e = validate({ ...form, [key]: val });
      setErrors(prev => ({ ...prev, [key]: e[key] }));
    }
  };

  const blur = (key) => {
    setTouched(t => ({ ...t, [key]: true }));
    const e = validate(form);
    setErrors(prev => ({ ...prev, [key]: e[key] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success('Message sent! We will get back to you within 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inputCls = (key) =>
    `w-full px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all focus:outline-none ${
      errors[key] && touched[key]
        ? 'border-red-400 bg-red-50 focus:border-red-500'
        : touched[key] && !errors[key]
        ? 'border-green-500 bg-green-50 focus:border-green-600'
        : 'border-gray-200 bg-white focus:border-primary-900'
    }`;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <style>{PAGE_CSS}</style>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D2B10 0%, #1B5E20 55%, #2E7D32 100%)', padding: '64px 0 72px' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb-a absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%)' }} />
          <div className="orb-b absolute -bottom-16 -left-16 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%)' }} />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          {/* Breadcrumb */}
          <div className="hero-t1 flex items-center justify-center gap-1.5 text-xs text-white/60 mb-5">
            <Link href="/" className="text-white/70 hover:text-white font-semibold transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-semibold">Contact Us</span>
          </div>
          <div className="hero-t1 inline-block bg-white/15 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            📞 We&apos;re here to help
          </div>
          <h1 className="hero-t2 font-heading font-extrabold text-white mb-4" style={{ fontSize: 'clamp(26px, 5vw, 46px)', textShadow: '0 2px 16px rgba(0,0,0,.3)' }}>
            Get in Touch
          </h1>
          <p className="hero-t3 text-white/75 max-w-md mx-auto text-sm leading-relaxed">
            Have a question about our products? Need expert farming advice? We&apos;re just a call or message away.
          </p>
        </div>
      </section>

      {/* ── CONTACT CARDS ───────────────────────────────────── */}
      <section className="container mx-auto px-4" style={{ marginTop: -32 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CONTACT_CARDS.map(({ Icon, title, info, sub, href, color, bg, pulse, cta }, i) => (
            <div
              key={title}
              className="card-float"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <a
                href={href || undefined}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`block bg-white rounded-2xl p-5 shadow-soft border border-gray-100 hover:-translate-y-1 hover:shadow-medium transition-all duration-300 h-full ${href ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center mb-3 flex-shrink-0" style={{ background: bg }}>
                  {pulse && (
                    <span className="absolute inset-0 rounded-2xl" style={{ color: color + '40', animation: 'pulse-ring 2s ease infinite' }} />
                  )}
                  <Icon className="w-5 h-5 relative z-10" style={{ color }} />
                </div>
                <p className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                <p className="font-extrabold text-sm leading-snug mb-0.5" style={{ color }}>{info}</p>
                <p className="text-xs text-gray-400 font-medium leading-snug mb-3">{sub}</p>
                {cta && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors" style={{ background: bg, color }}>
                    {cta} →
                  </span>
                )}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORM + MAP ──────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="px-7 py-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-heading font-extrabold text-lg text-gray-900">Send a Message</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">We reply within 24 hours</p>
            </div>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); setTouched({}); setErrors({}); }}
                  className="px-6 py-2.5 bg-primary-900 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="p-7 space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full Name *" error={touched.name && errors.name}>
                    <input
                      className={inputCls('name')}
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      onBlur={() => blur('name')}
                    />
                  </Field>
                  <Field label="Phone *" error={touched.phone && errors.phone}>
                    <input
                      className={inputCls('phone')}
                      placeholder="10-digit mobile"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onBlur={() => blur('phone')}
                      inputMode="numeric"
                    />
                  </Field>
                </div>
                <Field label="Email (optional)" error={touched.email && errors.email}>
                  <input
                    className={inputCls('email')}
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onBlur={() => blur('email')}
                  />
                </Field>
                <Field label="Message *" error={touched.message && errors.message}>
                  <textarea
                    className={inputCls('message') + ' resize-none'}
                    rows={4}
                    placeholder="Tell us how we can help you — product enquiry, support, or feedback…"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    onBlur={() => blur('message')}
                  />
                  <p className="text-right text-xs text-gray-400 font-medium mt-1">{form.message.length}/500</p>
                </Field>

                {/* Quick topic chips */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Quick topic:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Product Enquiry', 'Order Support', 'Delivery Query', 'Return/Refund', 'Feedback'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('message', t + ': ')}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-primary"
                >
                  {sending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Address + Map */}
          <div className="flex flex-col gap-5">
            {/* Address card */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-900" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-gray-900 mb-2">Visit Our Store</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    SY No 444/3, Near Bharat Petroleum,<br />
                    Kadiri Road, Mulakalacheruvu,<br />
                    <span className="font-semibold text-gray-700">Andhra Pradesh – 517390</span>
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href="tel:9804599804"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-900 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> 9804599804
                    </a>
                    <a
                      href="https://wa.me/9440658294"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours card */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="w-full">
                  <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Business Hours</h3>
                  <div className="space-y-2">
                    {[
                      { day: 'Monday – Saturday', time: '9:00 AM – 6:00 PM', open: true },
                      { day: 'Sunday', time: 'Closed', open: false },
                    ].map(({ day, time, open }) => (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-700">{day}</span>
                        <span className={`font-bold text-xs px-2.5 py-1 rounded-full ${open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden flex-1" style={{ minHeight: 200 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3868.0!2d78.5!3d14.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzAwLjAiTiA3OMKwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 'none', minHeight: 200 }}
                allowFullScreen
                loading="lazy"
                title="KJN Shop Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOATING WHATSAPP ────────────────────────────────── */}
      <a
        href="https://wa.me/9440658294?text=Hi, I have a question about your products"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-5 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-xl hover:-translate-y-1 transition-all"
        style={{ boxShadow: '0 8px 24px rgba(37,211,102,.45)' }}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Chat on WhatsApp</span>
      </a>
    </div>
  );
}