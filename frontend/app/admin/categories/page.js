// ═══════════════════════════════════════════════
// PASTE THIS INTO: src/app/admin/categories/page.js
// ═══════════════════════════════════════════════
'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Grid } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', imageUrl: '', sortOrder: '0', parentId: '' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { const res = await api.get('/categories'); setCategories(res.data.data || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/categories', { ...form, sortOrder: parseInt(form.sortOrder || 0) });
      toast.success('Category created!');
      setForm({ name: '', slug: '', imageUrl: '', sortOrder: '0', parentId: '' });
      setShowForm(false); fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Categories</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Add New Category</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[
                { key: 'name', label: 'Category Name *', placeholder: 'e.g. Farm Equipment' },
                { key: 'slug', label: 'Slug', placeholder: 'farm-equipment (auto if empty)' },
                { key: 'imageUrl', label: 'Image URL', placeholder: 'https://...' },
                { key: 'sortOrder', label: 'Sort Order', placeholder: '0', type: 'number' },
              ].map(({ key, label, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</label>
                  <input className="input" type={type} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={label.includes('*')} style={{ fontSize: 13 }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Parent Category</label>
                <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                  <option value="">Top Level Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Create Category'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {loading
          ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)
          : categories.map(cat => (
            <div key={cat.id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {cat.imageUrl && <div style={{ height: 100, overflow: 'hidden', background: '#f9fafb' }}>
                <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>}
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>/{cat.slug}</p>
                    {cat.children?.length > 0 && <p style={{ fontSize: 11, color: '#1B5E20', marginTop: 2 }}>{cat.children.length} subcategories</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ background: cat.isActive ? '#E8F5E9' : '#f3f4f6', color: cat.isActive ? '#1B5E20' : '#9CA3AF', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}