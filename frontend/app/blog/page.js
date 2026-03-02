'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Tag, ChevronRight, Search, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 24 24' fill='none' stroke='%23E5E7EB' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded-full w-1/3" />
        <div className="h-5 bg-gray-200 rounded-full" />
        <div className="h-5 bg-gray-200 rounded-full w-4/5" />
        <div className="h-3 bg-gray-100 rounded-full" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [blogs,   setBlogs]   = useState([]);
  const [filtered,setFiltered]= useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 9;

  const fetchBlogs = async (pg = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/blogs?page=${pg}&limit=${LIMIT}`);
      setBlogs(res.data.data || []);
      setFiltered(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPage(pg);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(1); }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    setFiltered(q
      ? blogs.filter(b =>
          b.title.toLowerCase().includes(q) ||
          (b.excerpt || '').toLowerCase().includes(q) ||
          (b.tags || []).some(t => t.toLowerCase().includes(q))
        )
      : blogs
    );
  }, [search, blogs]);

  const featuredBlog = !loading && !search && filtered[0];
  const restBlogs    = !loading && !search ? filtered.slice(1) : filtered;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Hero band ── */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-green-600 text-white overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5" />
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-semibold mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-bold">Blog</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-heading font-extrabold text-3xl text-white">Farming Tips & Guides</h1>
              </div>
              <p className="text-white/70 text-sm font-medium">
                Expert advice, product guides and seasonal farming tips
              </p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm font-medium focus:outline-none focus:bg-white/25 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Search result info */}
        {search && !loading && (
          <p className="text-sm text-gray-500 font-semibold mb-5">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;
            <span className="text-gray-900 font-bold">{search}</span>&rdquo;
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(LIMIT).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-gray-800 mb-2">No posts found</h3>
            <p className="text-gray-400 text-sm mb-5">
              {search ? 'Try a different search term.' : 'Check back soon for new articles!'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="px-6 py-2.5 bg-primary-900 text-white font-bold text-sm rounded-xl hover:bg-primary-800 transition-colors">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured post (first, full width) */}
            {featuredBlog && (
              <Link href={`/blog/${featuredBlog.slug}`} className="group block mb-8">
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-primary-900/20 group-hover:shadow-xl transition-all duration-300 md:grid md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto overflow-hidden bg-gray-100">
                    <img
                      src={featuredBlog.coverImage || NO_IMG}
                      alt={featuredBlog.title}
                      onError={e => { e.currentTarget.src = NO_IMG; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-900 text-xs font-extrabold px-3 py-1 rounded-full w-fit mb-4">
                      <BookOpen className="w-3 h-3" /> Featured Post
                    </span>
                    <h2 className="font-heading font-extrabold text-xl md:text-2xl text-gray-900 leading-snug mb-3 group-hover:text-primary-900 transition-colors line-clamp-3">
                      {featuredBlog.title}
                    </h2>
                    {featuredBlog.excerpt && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{featuredBlog.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {featuredBlog.publishedAt
                          ? new Date(featuredBlog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Recent'}
                      </div>
                      <span className="flex items-center gap-1 text-sm font-bold text-primary-900 group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest of posts */}
            {restBlogs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {restBlogs.map(blog => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`} className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 group-hover:border-primary-900/20 group-hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Cover */}
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={blog.coverImage || NO_IMG}
                          alt={blog.title}
                          onError={e => { e.currentTarget.src = NO_IMG; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {blog.publishedAt
                            ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Recent'}
                        </div>
                        <h3 className="font-heading font-extrabold text-base text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-primary-900 transition-colors flex-1">
                          {blog.title}
                        </h3>
                        {blog.excerpt && (
                          <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{blog.excerpt}</p>
                        )}
                        {/* Tags */}
                        {(blog.tags || []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {blog.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                <Tag className="w-2.5 h-2.5" />{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm font-bold text-primary-900 group-hover:gap-2 transition-all mt-auto">
                          Read More <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!search && Math.ceil(total / LIMIT) > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => fetchBlogs(page - 1)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 disabled:opacity-40 hover:border-primary-900 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.ceil(total / LIMIT) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchBlogs(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                      page === p ? 'bg-primary-900 text-white' : 'border-2 border-gray-200 text-gray-700 hover:border-primary-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page === Math.ceil(total / LIMIT)}
                  onClick={() => fetchBlogs(page + 1)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 disabled:opacity-40 hover:border-primary-900 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


