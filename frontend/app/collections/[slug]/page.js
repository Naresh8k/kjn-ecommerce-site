'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

export default function CollectionPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/collections/${slug}`)
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', padding: '28px 0', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 8, opacity: 0.8 }}>
            <Link href="/" style={{ color: 'white' }}>Home</Link>
            <ChevronRight style={{ width: 12 }} />
            <span>{data?.collection?.name || slug}</span>
          </div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(20px, 4vw, 32px)', color: 'white', marginBottom: 4 }}>
            {data?.collection?.name || 'Collection'}
          </h1>
          {data?.collection?.description && <p style={{ fontSize: 13, opacity: 0.85 }}>{data.collection.description}</p>}
        </div>
      </div>
      <div className="container" style={{ padding: '24px 16px' }}>
        {loading ? (
          <div className="products-grid">
            {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12 }} />)}
          </div>
        ) : data?.data?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20 }}>No products in this collection</h3>
          </div>
        ) : (
          <div className="products-grid">
            {data?.data?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}