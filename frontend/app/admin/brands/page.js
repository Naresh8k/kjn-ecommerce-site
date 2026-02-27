'use client';
import { useEffect, useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', logoUrl: '', description: '' });

  useEffect(() => {
    api.get('/brands').then(r => setBrands(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post('/brands', form);
      toast.success('Brand created!');
      setBrands(prev => [...prev, res.data.data]);
      setForm({ name: '', slug: '', logoUrl: '', description: '' });
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Brands <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({brands.length})</span></h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Brand'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Add New Brand</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[
                { key: 'name', label: 'Brand Name *', placeholder: 'e.g. Neptune' },
                { key: 'slug', label: 'Slug', placeholder: 'neptune (auto if empty)' },
                { key: 'logoUrl', label: 'Logo URL', placeholder: 'https://...' },
                { key: 'description', label: 'Description', placeholder: 'Brand description' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</label>
                  <input className="input" placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={label.includes('*')} style={{ fontSize: 13 }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Create Brand'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
        {loading
          ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)
          : brands.map(brand => (
            <div key={brand.id} style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
              {brand.logoUrl
                ? <img src={brand.logoUrl} alt={brand.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10, border: '1px solid #e5e7eb' }} />
                : <div style={{ width: 48, height: 48, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag style={{ width: 22, color: '#1B5E20' }} />
                  </div>}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{brand.name}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>/{brand.slug}</p>
                <span style={{ background: brand.isActive ? '#E8F5E9' : '#f3f4f6', color: brand.isActive ? '#1B5E20' : '#9CA3AF', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                  {brand.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}