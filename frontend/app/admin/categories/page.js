// // ═══════════════════════════════════════════════
// // PASTE THIS INTO: src/app/admin/categories/page.js
// // ═══════════════════════════════════════════════
// 'use client';
// import { useEffect, useState } from 'react';
// import { Plus, Edit2, Trash2, Grid } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '@/lib/api';

// export default function AdminCategoriesPage() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({ name: '', slug: '', imageUrl: '', sortOrder: '0', parentId: '' });

//   useEffect(() => { fetchCategories(); }, []);

//   const fetchCategories = async () => {
//     try { const res = await api.get('/categories'); setCategories(res.data.data || []); }
//     catch { toast.error('Failed to load'); }
//     finally { setLoading(false); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setSaving(true);
//     try {
//       await api.post('/categories', { ...form, sortOrder: parseInt(form.sortOrder || 0) });
//       toast.success('Category created!');
//       setForm({ name: '', slug: '', imageUrl: '', sortOrder: '0', parentId: '' });
//       setShowForm(false); fetchCategories();
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//     finally { setSaving(false); }
//   };

//   return (
//     <div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//         <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Categories</h2>
//         <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
//           <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Category'}
//         </button>
//       </div>

//       {showForm && (
//         <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
//           <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Add New Category</h3>
//           <form onSubmit={handleSubmit}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
//               {[
//                 { key: 'name', label: 'Category Name *', placeholder: 'e.g. Farm Equipment' },
//                 { key: 'slug', label: 'Slug', placeholder: 'farm-equipment (auto if empty)' },
//                 { key: 'imageUrl', label: 'Image URL', placeholder: 'https://...' },
//                 { key: 'sortOrder', label: 'Sort Order', placeholder: '0', type: 'number' },
//               ].map(({ key, label, placeholder, type = 'text' }) => (
//                 <div key={key}>
//                   <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{label}</label>
//                   <input className="input" type={type} placeholder={placeholder} value={form[key]}
//                     onChange={e => setForm({ ...form, [key]: e.target.value })}
//                     required={label.includes('*')} style={{ fontSize: 13 }} />
//                 </div>
//               ))}
//               <div>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Parent Category</label>
//                 <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}
//                   style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
//                   <option value="">Top Level Category</option>
//                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div style={{ display: 'flex', gap: 10 }}>
//               <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Create Category'}</button>
//               <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
//         {loading
//           ? Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)
//           : categories.map(cat => (
//             <div key={cat.id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
//               {cat.imageUrl && <div style={{ height: 100, overflow: 'hidden', background: '#f9fafb' }}>
//                 <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//               </div>}
//               <div style={{ padding: '14px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <div>
//                     <p style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</p>
//                     <p style={{ fontSize: 11, color: '#9CA3AF' }}>/{cat.slug}</p>
//                     {cat.children?.length > 0 && <p style={{ fontSize: 11, color: '#1B5E20', marginTop: 2 }}>{cat.children.length} subcategories</p>}
//                   </div>
//                   <div style={{ display: 'flex', gap: 6 }}>
//                     <span style={{ background: cat.isActive ? '#E8F5E9' : '#f3f4f6', color: cat.isActive ? '#1B5E20' : '#9CA3AF', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
//                       {cat.isActive ? 'Active' : 'Hidden'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// }

'use client';
import { useState, useEffect } from 'react';
import { Plus, Layers, Edit2, Trash2, X } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', image: '', isActive: true });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data.data || []);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-2xl text-gray-900">Categories</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-900 transition-colors shadow-primary"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl p-4 border border-gray-200 text-center group hover:shadow-md transition-all">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary-50 border-2 border-primary-100 overflow-hidden">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Layers className="w-8 h-8 text-primary-600" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">{cat.name}</h3>
            <p className="text-xs text-gray-500 mb-3">/{cat.slug}</p>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
              cat.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {cat.isActive ? 'Active' : 'Hidden'}
            </span>
            <div className="flex gap-2 justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleDelete(cat.id, cat.name)}
                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-lg">Add Category</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="space-y-4">
              <ImageUploader
                endpoint="category-image"
                value={form.image}
                onChange={(img) => setForm(f => ({ ...f, image: img }))}
                label="Category Image"
              />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-800 focus:ring-4 focus:ring-primary-100 transition-all"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Electronics"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-900 shadow-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}