'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Grid } from 'lucide-react';
import api from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Grid style={{ width: 24, color: '#1B5E20' }} />
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26 }}>All Categories</h1>
        </div>
        <div className="category-grid" style={{ gap: 16 }}>
          {loading
            ? Array(10).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)
            : categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}>
                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', transition: 'all 0.25s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; }}>
                  <div style={{ aspectRatio: '4/3', background: '#E8F5E9', overflow: 'hidden' }}>
                    <img src={cat.imageUrl || '/placeholder.jpg'} alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseOver={e => e.target.style.transform = 'scale(1.08)'}
                      onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                  </div>
                  <div style={{ padding: '14px 12px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', marginBottom: 4 }}>{cat.name}</h3>
                    <p style={{ fontSize: 12, color: '#1B5E20', fontWeight: 600 }}>Browse Products →</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}