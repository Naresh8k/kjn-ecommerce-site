'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Tag, BookOpen, ChevronRight, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 24 24' fill='none' stroke='%23E5E7EB' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-3xl mb-8" />
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-3 bg-gray-200 rounded-full w-1/4" />
        <div className="h-8 bg-gray-200 rounded-full" />
        <div className="h-8 bg-gray-200 rounded-full w-5/6" />
        <div className="h-4 bg-gray-100 rounded-full" />
        <div className="h-4 bg-gray-100 rounded-full w-4/5" />
        <div className="h-4 bg-gray-100 rounded-full w-3/5" />
      </div>
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router   = useRouter();
  const [blog,    setBlog]    = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/blogs/${slug}`);
        setBlog(res.data.data);
        // load related (first 3 published posts excluding current)
        const rel = await api.get('/blogs?limit=4');
        setRelated((rel.data.data || []).filter(b => b.slug !== slug).slice(0, 3));
      } catch {
        router.push('/blog');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {loading ? (
        <div className="container mx-auto px-4 py-10"><Skeleton /></div>
      ) : !blog ? null : (
        <>
          {/* ?? Sticky top breadcrumb ?? */}
          <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
            <div className="container mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
              <Link href="/" className="hover:text-primary-900 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/blog" className="hover:text-primary-900 transition-colors flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Blog
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-800 font-bold truncate max-w-[200px]">{blog.title}</span>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">

              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-900 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>

              {/* Cover image */}
              {blog.coverImage && (
                <div className="aspect-video rounded-3xl overflow-hidden bg-gray-200 mb-8 shadow-lg">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    onError={e => { e.currentTarget.src = NO_IMG; }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Tags */}
              {(blog.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-primary-50 text-primary-900 text-xs font-bold px-3 py-1 rounded-full">
                      <Tag className="w-3 h-3" />{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="font-heading font-extrabold text-gray-900 leading-tight mb-4" style={{ fontSize: 'clamp(24px, 3.5vw, 36px)' }}>
                {blog.title}
              </h1>

              {/* Meta row */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : ''}
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary-900 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* Excerpt callout */}
              {blog.excerpt && (
                <div className="bg-primary-50 border-l-4 border-primary-900 px-5 py-4 rounded-r-2xl mb-7">
                  <p className="text-primary-900 font-semibold text-base leading-relaxed">{blog.excerpt}</p>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-sm max-w-none text-gray-700 leading-loose whitespace-pre-wrap text-[15px]">
                {blog.content || 'No content available.'}
              </div>

              {/* Bottom share + back */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                <Link href="/blog" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> All Posts
                </Link>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-900 font-bold text-sm rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share Post
                </button>
              </div>
            </div>

            {/* ?? Related posts ?? */}
            {related.length > 0 && (
              <div className="max-w-3xl mx-auto mt-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-7 bg-primary-900 rounded-full" />
                  <h2 className="font-heading font-extrabold text-xl text-gray-900">More Posts</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(r => (
                    <Link key={r.id} href={`/blog/${r.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-900/20 hover:shadow-md transition-all">
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={r.coverImage || NO_IMG}
                          alt={r.title}
                          onError={e => { e.currentTarget.src = NO_IMG; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-primary-900 transition-colors">
                          {r.title}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                          <Calendar className="w-3 h-3" />
                          {r.publishedAt
                            ? new Date(r.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


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