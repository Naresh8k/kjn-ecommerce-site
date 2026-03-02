// 'use client';
// import { useEffect, useState } from 'react';
// import { Plus, Tag } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '@/lib/api';

// export default function AdminBrandsPage() {
//   const [brands, setBrands] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({ name: '', slug: '', logoUrl: '', description: '' });

//   useEffect(() => {
//     api.get('/brands').then(r => setBrands(r.data.data || [])).finally(() => setLoading(false));
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setSaving(true);
//     try {
//       const res = await api.post('/brands', form);
//       toast.success('Brand created!');
//       setBrands(prev => [...prev, res.data.data]);
//       setForm({ name: '', slug: '', logoUrl: '', description: '' });
//       setShowForm(false);
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//     finally { setSaving(false); }
//   };

//   return (
//     <div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//         <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Brands <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({brands.length})</span></h2>
//         <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
//           <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Brand'}
//         </button>
//       </div>

//       {showForm && (
//         <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
//           <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Add New Brand</h3>
//           <form onSubmit={handleSubmit}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
//               {[
//                 { key: 'name', label: 'Brand Name *', placeholder: 'e.g. Neptune' },
//                 { key: 'slug', label: 'Slug', placeholder: 'neptune (auto if empty)' },
//                 { key: 'logoUrl', label: 'Logo URL', placeholder: 'https://...' },
//                 { key: 'description', label: 'Description', placeholder: 'Brand description' },
//               ].map(({ key, label, placeholder }) => (
//                 <div key={key}>
//                   <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</label>
//                   <input className="input" placeholder={placeholder} value={form[key]}
//                     onChange={e => setForm({ ...form, [key]: e.target.value })}
//                     required={label.includes('*')} style={{ fontSize: 13 }} />
//                 </div>
//               ))}
//             </div>
//             <div style={{ display: 'flex', gap: 10 }}>
//               <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Create Brand'}</button>
//               <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
//         {loading
//           ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)
//           : brands.map(brand => (
//             <div key={brand.id} style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
//               {brand.logoUrl
//                 ? <img src={brand.logoUrl} alt={brand.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10, border: '1px solid #e5e7eb' }} />
//                 : <div style={{ width: 48, height: 48, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <Tag style={{ width: 22, color: '#1B5E20' }} />
//                   </div>}
//               <div>
//                 <p style={{ fontWeight: 700, fontSize: 14 }}>{brand.name}</p>
//                 <p style={{ fontSize: 11, color: '#9CA3AF' }}>/{brand.slug}</p>
//                 <span style={{ background: brand.isActive ? '#E8F5E9' : '#f3f4f6', color: brand.isActive ? '#1B5E20' : '#9CA3AF', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
//                   {brand.isActive ? 'Active' : 'Hidden'}
//                 </span>
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// }
'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';

const emptyForm = { name: '', slug: '', logoUrl: '', description: '', isActive: true };

export default function AdminBrandsPage() {
  const [brands,   setBrands]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands?limit=100');
      setBrands(res.data.data || []);
    } catch { toast.error('Failed to load brands'); }
    finally { setLoading(false); }
  };

  const handleNameChange = (val) => {
    setForm(f => ({
      ...f, name: val,
      slug: editId ? f.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Brand name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        logo: form.logoUrl, // Changed from logoUrl to logo
        description: form.description,
        isActive: form.isActive
      };
      
      if (editId) {
        await api.put(`/brands/${editId}`, payload);
        toast.success('Brand updated!');
      } else {
        await api.post('/brands', payload);
        toast.success('Brand created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchBrands();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleEdit = (b) => {
    setForm({ name: b.name, slug: b.slug, logoUrl: b.logo || '', description: b.description || '', isActive: b.isActive !== false });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete brand "${name}"?`)) return;
    try {
      await api.delete(`/brands/${id}`);
      toast.success('Brand deleted');
      fetchBrands();
    } catch { toast.error('Cannot delete — brand may have products linked'); }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, color: '#1B5E20', margin: 0 }}>Brands</h1>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}>
          <Plus style={{ width: 16 }} /> Add Brand
        </button>
      </div>

      {/* Brand grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {brands.map(b => (
            <div key={b.id} style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px', textAlign: 'center', position: 'relative' }}>
              {/* Logo */}
              <div style={{ width: 72, height: 72, margin: '0 auto 12px', borderRadius: 12, overflow: 'hidden', background: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {b.logo
                  ? <img src={b.logo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                  : <Tag style={{ width: 28, color: '#D1D5DB' }} />
                }
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>{b.name}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 10px' }}>{b.slug}</p>
              <span style={{ background: b.isActive ? '#E8F5E9' : '#F3F4F6', color: b.isActive ? '#1B5E20' : '#6B7280', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, display: 'inline-block', marginBottom: 12 }}>
                {b.isActive ? 'Active' : 'Hidden'}
              </span>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                <button className="btn btn-outline btn-sm" onClick={() => handleEdit(b)}>Edit</button>
                <button onClick={() => handleDelete(b.id, b.name)} style={{ background: '#FEF2F2', color: '#DC2626', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}><Trash2 style={{ width: 12 }} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '28px', maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 17, color: '#1B5E20', margin: 0 }}>{editId ? 'Edit Brand' : 'Add Brand'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer' }}><X style={{ width: 16 }} /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── BRAND LOGO UPLOAD ── */}
              <ImageUploader
                endpoint="brand-logo"
                value={form.logoUrl}
                onChange={(url) => setForm(f => ({ ...f, logoUrl: url }))}
                label="Brand Logo"
                hint="Recommended: 400×400px, transparent PNG"
              />

              <div>
                <label className="form-label">Brand Name *</label>
                <input className="input" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Neptune" required />
              </div>

              <div>
                <label className="form-label">Slug (URL)</label>
                <input className="input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ fontSize: 12, color: '#6B7280' }} />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the brand..." style={{ minHeight: 72, resize: 'vertical', fontSize: 13 }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#1B5E20' }} />
                Active (visible on website)
              </label>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Brand' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}