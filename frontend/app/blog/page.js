'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar } from 'lucide-react';
import api from '@/lib/api';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blogs').then((r) => setBlogs(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E8F5E9', color: '#1B5E20', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            <BookOpen style={{ width: 14 }} /> Farming Tips & Guides
          </div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)' }}>Our Blog</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 8 }}>Expert advice, farming tips and product guides</p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />)}
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20 }}>No blogs yet</h3>
            <p style={{ color: '#6B7280' }}>Check back soon for farming tips and guides</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', height: '100%', transition: 'all 0.25s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; }}>
                  {blog.coverImage && (
                    <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#f9fafb' }}>
                      <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                    </div>
                  )}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#9CA3AF', fontSize: 12 }}>
                      <Calendar style={{ width: 13 }} />
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Draft'}
                    </div>
                    <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, lineHeight: 1.4, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.title}</h3>
                    {blog.excerpt && <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.excerpt}</p>}
                    <p style={{ marginTop: 14, color: '#1B5E20', fontWeight: 700, fontSize: 13 }}>Read More →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}