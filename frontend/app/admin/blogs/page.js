'use client';
import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, X, BookOpen,
  Eye, EyeOff, Calendar, Tag, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';

const EMPTY = {
  title: '', slug: '', excerpt: '', content: '',
  coverImage: '', tags: '', isPublished: false,
};

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-4">
      <div className="w-24 h-16 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  const [blogs,    setBlogs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState(null); // blog id for content preview

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blogs/admin/all');
      setBlogs(res.data.data || []);
    } catch { toast.error('Failed to load blogs'); }
    finally { setLoading(false); }
  };

  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

  const handleTitleChange = (val) =>
    setForm(f => ({ ...f, title: val, slug: editId ? f.slug : autoSlug(val) }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editId) {
        await api.put(`/blogs/${editId}`, payload);
        toast.success('Blog updated!');
      } else {
        await api.post('/blogs', payload);
        toast.success('Blog published!');
      }
      setShowForm(false); setEditId(null); setForm(EMPTY);
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleEdit = (b) => {
    setForm({
      title: b.title, slug: b.slug, excerpt: b.excerpt || '',
      content: b.content || '', coverImage: b.coverImage || '',
      tags: (b.tags || []).join(', '), isPublished: b.isPublished || false,
    });
    setEditId(b.id); setShowForm(true); setPreview(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post permanently?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Blog deleted');
      fetchBlogs();
    } catch { toast.error('Failed to delete'); }
  };

  const handleTogglePublish = async (b) => {
    try {
      await api.put(`/blogs/${b.id}`, {
        ...b,
        tags: b.tags || [],
        isPublished: !b.isPublished,
      });
      toast.success(b.isPublished ? 'Moved to drafts' : 'Published!');
      fetchBlogs();
    } catch { toast.error('Failed'); }
  };

  const published = blogs.filter(b => b.isPublished).length;
  const drafts    = blogs.filter(b => !b.isPublished).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="font-bold text-green-700">{published}</span> published ·{' '}
            <span className="font-bold text-amber-600">{drafts}</span> drafts
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-bold text-sm rounded-xl transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Posts', val: blogs.length, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Published',   val: published,    color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Drafts',      val: drafts,       color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 text-center`}>
            <p className={`font-heading font-extrabold text-2xl ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Blog list ── */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} />)}</div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-400 text-sm mb-5">Write your first farming tip or product guide</p>
          <button
            onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}
            className="px-6 py-2.5 bg-primary-900 text-white font-bold text-sm rounded-xl hover:bg-primary-800 transition-colors"
          >
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className="flex items-start gap-4 p-4">
                {/* Cover thumbnail */}
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  {b.coverImage
                    ? <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-300" />
                      </div>
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{b.title}</p>
                      {b.excerpt && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{b.excerpt}</p>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePublish(b)}
                        title={b.isPublished ? 'Move to Draft' : 'Publish'}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {b.isPublished
                          ? <EyeOff className="w-4 h-4 text-amber-600" />
                          : <Eye className="w-4 h-4 text-green-600" />
                        }
                      </button>
                      <button
                        onClick={() => handleEdit(b)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      b.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {b.isPublished ? '● Published' : '○ Draft'}
                    </span>
                    {b.publishedAt && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {(b.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expandable content preview */}
              {preview === b.id && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Content Preview</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">{b.content || '(no content)'}</p>
                </div>
              )}
              <button
                onClick={() => setPreview(preview === b.id ? null : b.id)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-400 hover:text-gray-600 border-t border-gray-50 transition-colors"
              >
                {preview === b.id ? <><ChevronUp className="w-3 h-3" /> Hide preview</> : <><ChevronDown className="w-3 h-3" /> Show content preview</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-4 overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-gray-900">
                  {editId ? 'Edit Blog Post' : 'New Blog Post'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editId ? 'Update content and settings' : 'Write and publish a new post'}
                </p>
              </div>
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                className="w-9 h-9 rounded-xl bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSave} className="px-6 py-5 space-y-5">

              {/* Cover image */}
              <ImageUploader
                endpoint="blog-cover"
                value={form.coverImage}
                onChange={url => setForm(f => ({ ...f, coverImage: url }))}
                label="Cover Image"
                hint="Recommended: 1200×630px"
              />

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                  placeholder="e.g. How to Choose the Right Battery Sprayer"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  URL Slug
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-primary-900 transition-colors">
                  <span className="px-3 py-2.5 text-xs text-gray-400 font-semibold bg-gray-50 border-r border-gray-200 flex-shrink-0">/blog/</span>
                  <input
                    className="flex-1 px-3 py-2.5 text-sm font-mono text-gray-600 focus:outline-none bg-white"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="my-blog-post-title"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Excerpt <span className="text-gray-400 font-normal normal-case">(shown on listing page)</span>
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none transition-colors resize-none"
                  placeholder="A short, compelling summary of the post..."
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Content <span className="text-gray-400 font-normal normal-case">(plain text or markdown)</span>
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none transition-colors resize-y"
                  placeholder="Write your full article here..."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  style={{ minHeight: 220 }}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Tags <span className="text-gray-400 font-normal normal-case">(comma separated)</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none transition-colors"
                  placeholder="farming, sprayers, tips, maintenance"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>

              {/* Publish toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div
                  onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${form.isPublished ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {form.isPublished ? 'Publish immediately' : 'Save as draft'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {form.isPublished ? 'Visible to all visitors' : 'Only visible to admins'}
                  </p>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-900 hover:bg-primary-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : editId ? 'Update Post' : form.isPublished ? 'Publish Post' : 'Save Draft'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

