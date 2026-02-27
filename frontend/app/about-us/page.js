import Link from 'next/link';
import { Tractor, Award, Users, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { val: '1000+', label: 'Products', icon: '📦' },
    { val: '50+', label: 'Brands', icon: '🏷️' },
    { val: '10K+', label: 'Happy Farmers', icon: '👨‍🌾' },
    { val: '5+', label: 'Years Experience', icon: '⭐' },
  ];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)', padding: '64px 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.15)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>🌾</div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(26px, 5vw, 44px)', color: 'white', marginBottom: 16 }}>About KJN Trading Company</h1>
          <p style={{ fontSize: 15, opacity: 0.9, maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            Your trusted partner for quality farm equipment, agricultural tools, and home essentials since 2019. Serving farmers across Andhra Pradesh with genuine products at best prices.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
          {stats.map(({ val, label, icon }) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 28, color: '#1B5E20', marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div style={{ background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Our Story</h2>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: '#4B5563', marginBottom: 16 }}>
            KJN Trading Company was founded with a simple mission — to make quality farm equipment accessible to every farmer in Andhra Pradesh. We understand the challenges farmers face and are committed to providing them with the best tools at fair prices.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.9, color: '#4B5563' }}>
            From sprayers and seeders to motors, control panels, fans, and irrigation fittings — we offer a comprehensive range of products from trusted brands. Our team of experts is always ready to help you find the right equipment for your needs.
          </p>
        </div>

        {/* Values */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { icon: Award, title: 'Quality First', desc: 'We only stock genuine products from certified manufacturers' },
            { icon: Users, title: 'Farmer Focused', desc: 'Our team understands farming needs and provides expert guidance' },
            { icon: Tractor, title: 'Wide Selection', desc: '1000+ products across 10 categories to meet all your needs' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 52, height: 52, background: '#E8F5E9', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon style={{ width: 24, color: '#1B5E20' }} />
              </div>
              <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', borderRadius: 20, padding: '32px', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, color: 'white', marginBottom: 12 }}>Ready to shop?</h2>
          <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 24 }}>Browse 1000+ products from 50+ trusted brands</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/categories/farm-equipments" className="btn btn-accent">Shop Now <ArrowRight style={{ width: 16 }} /></Link>
            <Link href="/contact-us" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}