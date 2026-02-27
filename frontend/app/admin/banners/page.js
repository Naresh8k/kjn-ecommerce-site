'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const positions = ['hero', 'banner2', 'sidebar', 'popup', 'category_top'];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'hero', sortOrder: '0', isActive: true, startsAt: '', endsAt: '' });

  useEffect(() => {
    api.get('/banners').then(r => setBanners(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post('/banners', { ...form, sortOrder: parseInt(form.sortOrder || 0) });
      toast.success('Banner created!');
      setBanners(prev => [...prev, res.data.data]);
      setForm({ title: '', imageUrl: '', linkUrl: '', position: 'hero', sortOrder: '0', isActive: true, startsAt: '', endsAt: '' });
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Deleted!');
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch { toast.error('Failed'); }
  };

  const handleToggle = async (banner) => {
    try {
      const res = await api.put(`/banners/${banner.id}`, { ...banner, isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b.id === banner.id ? res.data.data : b));
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Banners</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Add New Banner</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Title</label>
                <input className="input" placeholder="Banner title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Position</label>
                <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Image URL *</label>
                <input className="input" placeholder="https://image.cdn.../banner.jpg" value={form.imageUrl} required
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Link URL</label>
                <input className="input" placeholder="https://... or /categories/farm-equipments" value={form.linkUrl}
                  onChange={e => setForm({ ...form, linkUrl: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Sort Order</label>
                <input className="input" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                <input type="checkbox" id="bannerActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: 16, height: 16 }} />
                <label htmlFor="bannerActive" style={{ fontSize: 13, fontWeight: 600 }}>Active (visible to customers)</label>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Show From</label>
                <input className="input" type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Show Until</label>
                <input className="input" type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} style={{ fontSize: 13 }} />
              </div>
            </div>
            {form.imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Preview:</p>
                <img src={form.imageUrl} alt="Preview" style={{ maxHeight: 160, borderRadius: 10, border: '1px solid #e5e7eb', display: 'block' }} onError={e => e.target.style.display = 'none'} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Create Banner'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />)
          : banners.map(b => (
            <div key={b.id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: b.isActive ? '1px solid #e5e7eb' : '2px solid #FEE2E2' }}>
              <div style={{ height: 160, overflow: 'hidden', background: '#f9fafb', position: 'relative' }}>
                <img src={b.imageUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6 }}>
                  <span style={{ background: '#1B5E20', color: 'white', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{b.position}</span>
                  <span style={{ background: b.isActive ? '#16A34A' : '#DC2626', color: 'white', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{b.isActive ? 'Active' : 'Hidden'}</span>
                </div>
              </div>
              <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{b.title || 'Untitled Banner'}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>Sort: {b.sortOrder}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleToggle(b)} className="btn btn-outline btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
                    {b.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleDelete(b.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 style={{ width: 14, color: '#DC2626' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}