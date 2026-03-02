'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Grid } from 'lucide-react';
import api from '@/lib/api';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/brands')
      .then((r) => setBrands(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Grid style={{ width: 24, color: '#1B5E20' }} />
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26 }}>All Brands</h1>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />
              ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
            {brands.map((b) => (
              <Link key={b.id} href={`/brands/${b.slug}`}>
                <div
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    transition: 'all 0.25s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#E8F5E9',
                      marginBottom: 8,
                    }}
                  >
                    <img
                      src={b.logoUrl || 'https://via.placeholder.com/120x60?text=Brand'}
                      alt={b.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/120x60?text=Brand')}
                    />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', textAlign: 'center' }}>{b.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
