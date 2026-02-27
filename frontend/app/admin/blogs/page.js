'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { title: '', slug: '', excerpt: '', content: '', coverImage: '', isPublished: false, tags: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try { const res = await api.get('/blogs?limit=50'); setBlogs(res.data.data || []); }
    catch { toast.error('Failed to load blogs'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        publishedAt: form.isPublished ? new Date().toISOString() : null,
      };
      if (editBlog) {
        await api.put(`/blogs/${editBlog.id}`, payload);
        toast.success('Blog updated!');
      } else {
        await api.post('/blogs', payload);
        toast.success('Blog created!');
      }
      setShowForm(false); setEditBlog(null); setForm(emptyForm); fetchBlogs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (blog) => {
    setForm({
      title: blog.title, slug: blog.slug, excerpt: blog.excerpt || '',
      content: blog.content || '', coverImage: blog.coverImage || '',
      isPublished: blog.isPublished || false,
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
    });
    setEditBlog(blog); setShowForm(true); window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    try { await api.delete(`/blogs/${id}`); toast.success('Deleted!'); fetchBlogs(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleTogglePublish = async (blog) => {
    try {
      await api.put(`/blogs/${blog.id}`, { ...blog, isPublished: !blog.isPublished, publishedAt: !blog.isPublished ? new Date().toISOString() : null });
      toast.success(blog.isPublished ? 'Blog unpublished' : 'Blog published!');
      fetchBlogs();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Blogs <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({blogs.length})</span></h2>
        <button onClick={() => { setShowForm(!showForm); setEditBlog(null); setForm(emptyForm); }} className="btn btn-primary btn-sm">
          <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'New Blog Post'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{editBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Title *</label>
                <input className="input" placeholder="Blog post title..." value={form.title} required
                  onChange={e => setForm({ ...form, title: e.target.value })} style={{ fontSize: 14 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Slug (auto-generated)</label>
                <input className="input" placeholder="blog-post-slug" value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Cover Image URL</label>
                <input className="input" placeholder="https://..." value={form.coverImage}
                  onChange={e => setForm({ ...form, coverImage: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Excerpt (short summary)</label>
                <input className="input" placeholder="Brief summary shown in blog listing..." value={form.excerpt}
                  onChange={e => setForm({ ...form, excerpt: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Tags (comma separated)</label>
                <input className="input" placeholder="farming, tips, sprayer" value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
                <input type="checkbox" id="isPublished" checked={form.isPublished}
                  onChange={e => setForm({ ...form, isPublished: e.target.checked })} style={{ width: 16, height: 16 }} />
                <label htmlFor="isPublished" style={{ fontSize: 13, fontWeight: 600 }}>Publish immediately</label>
              </div>
            </div>

            {form.coverImage && (
              <div style={{ marginBottom: 14 }}>
                <img src={form.coverImage} alt="Cover" style={{ height: 120, borderRadius: 10, border: '1px solid #e5e7eb', display: 'block' }} onError={e => e.target.style.display = 'none'} />
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Content *</label>
              <textarea className="input" placeholder="Write your blog content here... (supports plain text)" value={form.content} required
                onChange={e => setForm({ ...form, content: e.target.value })}
                style={{ minHeight: 280, resize: 'vertical', fontSize: 14, lineHeight: 1.8 }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : editBlog ? 'Update Blog' : 'Publish Blog'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditBlog(null); setForm(emptyForm); }} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Blog List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)
          : blogs.length === 0
            ? (
              <div style={{ background: 'white', borderRadius: 16, padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <BookOpen style={{ width: 48, height: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
                <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No blog posts yet</h3>
                <p style={{ color: '#6B7280', fontSize: 13 }}>Create your first farming tips & guides post</p>
              </div>
            )
            : blogs.map(blog => (
              <div key={blog.id} style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {blog.coverImage
                  ? <img src={blog.coverImage} alt={blog.title} style={{ width: 80, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 80, height: 60, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen style={{ width: 24, color: '#1B5E20' }} />
                    </div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.title}</p>
                      {blog.excerpt && <p style={{ fontSize: 12, color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.excerpt}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => handleTogglePublish(blog)}
                        style={{ padding: '4px 12px', borderRadius: 99, border: 'none', background: blog.isPublished ? '#E8F5E9' : '#f3f4f6', color: blog.isPublished ? '#1B5E20' : '#6B7280', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                        {blog.isPublished ? '✓ Published' : 'Draft'}
                      </button>
                      <button onClick={() => handleEdit(blog)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Edit2 style={{ width: 14, color: '#374151' }} />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 style={{ width: 14, color: '#DC2626' }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {Array.isArray(blog.tags) && blog.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ background: '#E8F5E9', color: '#1B5E20', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}