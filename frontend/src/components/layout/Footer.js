'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Youtube, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0F2412', color: '#d1d5db', marginTop: 'auto' }}>
      {/* Top strip */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>KJN</div>
            <div>
              <div style={{ color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: 18 }}>KJN Shop</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Your Farm Equipment Partner</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { icon: Youtube, href: 'https://youtube.com/@shopatkjn' },
              { icon: Twitter, href: 'https://x.com/_kjn__' },
              { icon: Facebook, href: 'https://facebook.com/profile.php?id=61562979543949' },
              { icon: Instagram, href: 'https://instagram.com/shopatkjn' },
            ].map(({ icon: Icon, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                <Icon style={{ width: 18, color: 'white' }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container" style={{ padding: '40px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Sora', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <MapPin style={{ width: 16, flexShrink: 0, marginTop: 2, color: '#4ade80' }} />
                <span style={{ fontSize: 13, lineHeight: 1.6 }}>SY No 444/3, Near Bharat Petroleum, Kadiri Road, Mulakalacheruvu, AP – 517390</span>
              </div>
              <a href="tel:9804599804" style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#d1d5db', fontSize: 13 }}>
                <Phone style={{ width: 16, color: '#4ade80' }} /> 9804599804
              </a>
              <a href="mailto:info@shopatkjn.com" style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#d1d5db', fontSize: 13 }}>
                <Mail style={{ width: 16, color: '#4ade80' }} /> info@shopatkjn.com
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Sora', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Home', href: '/' },
                { label: 'My Orders', href: '/orders' },
                { label: 'My Account', href: '/account' },
                { label: 'About Us', href: '/about-us' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact Us', href: '/contact-us' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{ fontSize: 13, color: '#d1d5db', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = '#4ade80'}
                  onMouseOut={e => e.target.style.color = '#d1d5db'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Sora', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Policies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Payment Policy', href: '/payment-policy' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Return & Refund', href: '/refund-policy' },
                { label: 'Shipping Policy', href: '/shipping-policy' },
                { label: 'Terms & Conditions', href: '/tos' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{ fontSize: 13, color: '#d1d5db', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = '#4ade80'}
                  onMouseOut={e => e.target.style.color = '#d1d5db'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Sora', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Farming Tools', href: '/categories/farm-equipments' },
                { label: 'Garden Tools', href: '/categories/garden-tools' },
                { label: 'Chaff Cutters', href: '/categories/chaff-cutters' },
                { label: 'Fans & Lighting', href: '/categories/fans-lighting' },
                { label: 'Irrigation Fittings', href: '/categories/irrigation-items' },
                { label: 'Motors & Fittings', href: '/categories/motors-fittings' },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{ fontSize: 13, color: '#d1d5db', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = '#4ade80'}
                  onMouseOut={e => e.target.style.color = '#d1d5db'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>© 2026 KJN Trading Company. All rights reserved. GSTIN: 37CMMPK7267H1ZG</p>
          <img src="https://image.cdn.shpy.in/static/web-store/payment-methods.png" alt="Payment Methods" style={{ height: 28, opacity: 0.7 }} />
        </div>
      </div>
    </footer>
  );
}