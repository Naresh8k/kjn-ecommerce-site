'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then((r) => setBlog(r.data.data))
      .catch(() => router.push('/blog'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E8F5E9', borderTop: '4px solid #1B5E20', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!blog) return null;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1B5E20', fontWeight: 700, fontSize: 13, marginBottom: 24 }}>
          <ArrowLeft style={{ width: 16 }} /> Back to Blog
        </Link>
        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          {blog.coverImage && (
            <div style={{ aspectRatio: '16/7', overflow: 'hidden' }}>
              <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#9CA3AF', fontSize: 13 }}>
              <Calendar style={{ width: 14 }} />
              {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </div>
            <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.3, marginBottom: 24 }}>{blog.title}</h1>
            {blog.excerpt && (
              <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.8, marginBottom: 24, padding: '16px', background: '#E8F5E9', borderRadius: 12, borderLeft: '4px solid #1B5E20' }}>
                {blog.excerpt}
              </p>
            )}
            <div style={{ fontSize: 15, lineHeight: 1.9, color: '#374151', whiteSpace: 'pre-wrap' }}>{blog.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
}