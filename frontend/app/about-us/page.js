'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Tractor, Award, Users, ArrowRight, CheckCircle, Leaf, ShieldCheck, Star, Phone, MapPin, Package } from 'lucide-react';

/* ── Animated counter hook ─────────────────────────────────── */
function useCounter(target, duration = 1600, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const num = parseInt(target.replace(/\D/g, ''), 10);
    if (!num) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * num));
      if (p < 1) requestAnimationFrame(step);
      else setVal(num);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  const suffix = target.replace(/[\d,]/g, '');
  return val > 0 ? `${val.toLocaleString()}${suffix}` : '0';
}

/* ── Scroll-reveal hook ────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ val, label, icon, color, delay = 0 }) {
  const [ref, visible] = useReveal(0.3);
  const display = useCounter(val, 1400, visible);
  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-6 text-center shadow-soft border border-gray-100 hover:-translate-y-1 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms, box-shadow .3s ease`,
      }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-heading font-extrabold text-3xl mb-1" style={{ color }}>{display}</div>
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* ── Value card ────────────────────────────────────────────── */
function ValueCard({ Icon, title, desc, color, bg, delay = 0 }) {
  const [ref, visible] = useReveal(0.2);
  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 group hover:-translate-y-1.5 hover:shadow-medium transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity .55s ease ${delay}ms, transform .55s cubic-bezier(.22,1,.36,1) ${delay}ms, box-shadow .3s ease`,
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{ background: bg }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="font-heading font-bold text-base text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

const PAGE_CSS = `
  @keyframes orb-drift-a{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-20px)}}
  @keyframes orb-drift-b{0%,100%{transform:translate(0,0)}50%{transform:translate(-14px,16px)}}
  @keyframes float-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes hero-fade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes badge-pop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
  @keyframes underline-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .hero-t1{animation:hero-fade .6s cubic-bezier(.22,1,.36,1) .05s both}
  .hero-t2{animation:hero-fade .6s cubic-bezier(.22,1,.36,1) .2s both}
  .hero-t3{animation:hero-fade .6s cubic-bezier(.22,1,.36,1) .35s both}
  .hero-badge{animation:badge-pop .5s cubic-bezier(.22,1,.36,1) both}
  .orb-a{animation:orb-drift-a 14s ease-in-out infinite}
  .orb-b{animation:orb-drift-b 18s ease-in-out infinite}
  .float-bob{animation:float-bob 5s ease-in-out infinite}
  .section-bar{transform-origin:left;animation:underline-draw .5s cubic-bezier(.22,1,.36,1) .1s both}
  .timeline-line::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#1B5E20,#66BB6A);transform:translateX(-50%)}
`;

export default function AboutPage() {
  const [storyRef, storyVisible] = useReveal(0.1);
  const [tlRef, tlVisible] = useReveal(0.1);
  const [ctaRef, ctaVisible] = useReveal(0.15);

  const stats = [
    { val: '1000+', label: 'Products', icon: '📦', color: '#1B5E20', delay: 0 },
    { val: '50+',   label: 'Brands',   icon: '🏷️', color: '#2563EB', delay: 100 },
    { val: '10000+', label: 'Happy Farmers', icon: '👨‍🌾', color: '#D97706', delay: 200 },
    { val: '5+',    label: 'Years Experience', icon: '⭐', color: '#7C3AED', delay: 300 },
  ];

  const values = [
    { Icon: ShieldCheck, title: 'Quality First', desc: 'We only stock genuine products from certified manufacturers — no counterfeits, no compromise.', color: '#16A34A', bg: '#DCFCE7', delay: 0 },
    { Icon: Users, title: 'Farmer Focused', desc: 'Our team understands farming needs and provides expert guidance to help you pick the right tools.', color: '#2563EB', bg: '#DBEAFE', delay: 100 },
    { Icon: Tractor, title: 'Wide Selection', desc: '1000+ products across 10 categories — sprayers, motors, tools, fans and more, all in one place.', color: '#D97706', bg: '#FEF3C7', delay: 200 },
    { Icon: Leaf, title: 'Sustainable Farming', desc: 'We promote eco-friendly equipment that helps farmers improve yield while caring for the land.', color: '#059669', bg: '#D1FAE5', delay: 300 },
  ];

  const timeline = [
    { year: '2019', title: 'Founded', desc: 'KJN Trading Company started with a vision to serve farmers in Andhra Pradesh with genuine equipment.' },
    { year: '2020', title: 'Expanded Range', desc: 'Added motors, control panels, and irrigation fittings to better serve agriculture needs.' },
    { year: '2022', title: '5,000 Farmers Served', desc: 'Reached a major milestone of 5,000 happy customers across the region.' },
    { year: '2024', title: '10,000+ Customers', desc: 'Launched online store and crossed 10,000 satisfied farmers with 50+ trusted brands.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <style>{PAGE_CSS}</style>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D2B10 0%, #1B5E20 55%, #2E7D32 100%)', padding: '72px 0 80px' }}
      >
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb-a absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%)' }} />
          <div className="orb-b absolute bottom-0 -left-16 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%)' }} />
          <div className="float-bob absolute bottom-8 right-1/4 text-5xl opacity-20 select-none">🌾</div>
          <div className="float-bob absolute top-10 left-1/3 text-3xl opacity-15 select-none" style={{ animationDelay: '1.2s' }}>🌱</div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="hero-badge inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            Est. 2019 · Andhra Pradesh
          </div>
          <h1 className="hero-t1 font-heading font-extrabold text-white leading-tight mb-5" style={{ fontSize: 'clamp(28px, 5vw, 52px)', textShadow: '0 2px 20px rgba(0,0,0,.3)' }}>
            About KJN Trading Company
          </h1>
          <p className="hero-t2 text-white/80 max-w-xl mx-auto leading-relaxed mb-8" style={{ fontSize: 'clamp(14px, 2vw, 16px)' }}>
            Your trusted partner for quality farm equipment, agricultural tools, and home essentials since 2019. Serving farmers across Andhra Pradesh with genuine products at the best prices.
          </p>
          <div className="hero-t3 flex flex-wrap gap-3 justify-center">
            <Link href="/products" className="inline-flex items-center gap-2 bg-white text-primary-900 font-extrabold px-6 py-3 rounded-full text-sm shadow-lg hover:bg-primary-50 hover:-translate-y-0.5 transition-all">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact-us" className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4" style={{ marginTop: -28 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── OUR STORY ───────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-14">
        <div
          ref={storyRef}
          className="bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-100"
          style={{
            opacity: storyVisible ? 1 : 0,
            transform: storyVisible ? 'translateY(0)' : 'translateY(32px)',
            transition: 'opacity .65s ease, transform .65s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Text */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="section-bar w-1.5 h-8 bg-primary-900 rounded-full flex-shrink-0" />
                <h2 className="font-heading font-extrabold text-2xl text-gray-900">Our Story</h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                KJN Trading Company was founded with a simple mission — to make quality farm equipment accessible to every farmer in Andhra Pradesh. We understand the challenges farmers face and are committed to providing them with the best tools at fair prices.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                From sprayers and seeders to motors, control panels, fans, and irrigation fittings — we offer a comprehensive range of products from trusted brands. Our team of experts is always ready to help you find the right equipment for your needs.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Authorised dealer for 50+ premium brands',
                  'Serving 10,000+ farmers across Andhra Pradesh',
                  'Genuine products with manufacturer warranty',
                  'Expert guidance & after-sales support',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Visual panel */}
            <div className="relative flex items-center justify-center p-8 md:p-12" style={{ background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' }}>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary-900/10" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary-900/10" />
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-xs">
                {[
                  { emoji: '🚜', label: 'Farm Equipment' },
                  { emoji: '💧', label: 'Irrigation' },
                  { emoji: '⚡', label: 'Motors & Panels' },
                  { emoji: '🌿', label: 'Garden Tools' },
                ].map(({ emoji, label }) => (
                  <div key={label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-sm border border-white hover:scale-105 transition-transform duration-300">
                    <div className="text-3xl mb-2">{emoji}</div>
                    <p className="text-xs font-bold text-gray-700 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ──────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pb-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-8 h-1 bg-primary-900 rounded-full" />
            <h2 className="font-heading font-extrabold text-2xl text-gray-900">Our Values</h2>
            <div className="w-8 h-1 bg-primary-900 rounded-full" />
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">The principles that guide everything we do</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map(v => <ValueCard key={v.title} {...v} />)}
        </div>
      </section>

      {/* ── JOURNEY TIMELINE ────────────────────────────────── */}
      <section className="bg-white py-14 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-primary-900 rounded-full" />
              <h2 className="font-heading font-extrabold text-2xl text-gray-900">Our Journey</h2>
              <div className="w-8 h-1 bg-primary-900 rounded-full" />
            </div>
            <p className="text-sm text-gray-500">From a small shop to serving 10,000+ farmers</p>
          </div>
          <div
            ref={tlRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          >
            {/* connector line on large screens */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-900 via-green-400 to-primary-900 opacity-25 pointer-events-none" />

            {timeline.map(({ year, title, desc }, i) => (
              <div
                key={year}
                className="relative flex flex-col items-center text-center"
                style={{
                  opacity: tlVisible ? 1 : 0,
                  transform: tlVisible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity .55s ease ${i * 120}ms, transform .55s cubic-bezier(.22,1,.36,1) ${i * 120}ms`,
                }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-heading font-extrabold text-sm text-white shadow-md mb-4 z-10 relative border-4 border-white" style={{ background: 'linear-gradient(135deg, #1B5E20, #43A047)' }}>
                  {year}
                </div>
                <h3 className="font-heading font-bold text-base text-gray-900 mb-2">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────────────── */}
      <section className="py-14" style={{ background: 'linear-gradient(135deg, #0D2B10 0%, #1B5E20 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading font-extrabold text-2xl text-white mb-2">Why Farmers Choose KJN</h2>
            <p className="text-white/60 text-sm">Trusted, reliable, and always farmer-first</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Star, val: '4.8★', label: 'Average Rating', sub: 'Based on 2,000+ reviews', color: '#FACC15' },
              { icon: Package, val: '1000+', label: 'Products Available', sub: 'Across 10 categories', color: '#4ADE80' },
              { icon: MapPin, val: 'AP-Wide', label: 'Delivery Coverage', sub: 'All districts covered', color: '#60A5FA' },
            ].map(({ icon: Icon, val, label, sub, color }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/15 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: color + '25' }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="font-heading font-extrabold text-2xl text-white mb-1">{val}</div>
                <div className="text-sm font-bold text-white/80 mb-1">{label}</div>
                <div className="text-xs text-white/50">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-14">
        <div
          ref={ctaRef}
          className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #43A047)',
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(20px)',
            transition: 'opacity .6s ease, transform .6s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="orb-a absolute -top-16 -right-16 w-56 h-56 rounded-full" style={{ background: 'rgba(255,255,255,.07)' }} />
            <div className="orb-b absolute -bottom-12 -left-12 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,.05)' }} />
          </div>
          <div className="relative z-10">
            <div className="inline-block bg-white/15 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              🛒 Start Shopping Today
            </div>
            <h2 className="font-heading font-extrabold text-white mb-3" style={{ fontSize: 'clamp(22px, 3.5vw, 34px)' }}>
              Ready to equip your farm?
            </h2>
            <p className="text-white/75 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Browse 1000+ products from 50+ trusted brands. Free delivery above ₹500. Genuine products guaranteed.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/categories/farm-equipments" className="inline-flex items-center gap-2 bg-white text-primary-900 font-extrabold px-7 py-3.5 rounded-full text-sm shadow-lg hover:bg-primary-50 hover:-translate-y-0.5 transition-all">
                Shop Farm Equipment <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact-us" className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-bold px-7 py-3.5 rounded-full text-sm hover:bg-white/10 transition-colors">
                <Phone className="w-4 h-4" /> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}