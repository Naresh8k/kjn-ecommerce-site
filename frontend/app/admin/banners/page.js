// 'use client';
// import { useEffect, useState } from 'react';
// import { Plus, Trash2, Edit2 } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '@/lib/api';

// const positions = ['hero', 'banner2', 'sidebar', 'popup', 'category_top'];

// export default function AdminBannersPage() {
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'hero', sortOrder: '0', isActive: true, startsAt: '', endsAt: '' });

//   useEffect(() => {
//     api.get('/banners').then(r => setBanners(r.data.data || [])).finally(() => setLoading(false));
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setSaving(true);
//     try {
//       // convert empty date strings to undefined so Prisma doesn't reject them
//       const payload = { ...form, sortOrder: parseInt(form.sortOrder || '0') };
//       if (!payload.startsAt) delete payload.startsAt;
//       if (!payload.endsAt) delete payload.endsAt;
//       // ensure valid ISO timestamp (datetime-local omits seconds)
//       if (payload.startsAt) payload.startsAt = new Date(payload.startsAt).toISOString();
//       if (payload.endsAt) payload.endsAt = new Date(payload.endsAt).toISOString();
//       const res = await api.post('/banners', payload);
//       toast.success('Banner created!');
//       setBanners(prev => [...prev, res.data.data]);
//       setForm({ title: '', imageUrl: '', linkUrl: '', position: 'hero', sortOrder: '0', isActive: true, startsAt: '', endsAt: '' });
//       setShowForm(false);
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Delete banner?')) return;
//     try {
//       await api.delete(`/banners/${id}`);
//       toast.success('Deleted!');
//       setBanners(prev => prev.filter(b => b.id !== id));
//     } catch { toast.error('Failed'); }
//   };

//   const handleToggle = async (banner) => {
//     try {
//       const res = await api.put(`/banners/${banner.id}`, { ...banner, isActive: !banner.isActive });
//       setBanners(prev => prev.map(b => b.id === banner.id ? res.data.data : b));
//     } catch { toast.error('Failed'); }
//   };

//   return (
//     <div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//         <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Banners</h2>
//         <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
//           <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Banner'}
//         </button>
//       </div>

//       {showForm && (
//         <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
//           <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Add New Banner</h3>
//           <form onSubmit={handleSubmit}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
//               <div>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Title</label>
//                 <input className="input" placeholder="Banner title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ fontSize: 13 }} />
//               </div>
//               <div>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Position</label>
//                 <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
//                   style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
//                   {positions.map(p => <option key={p} value={p}>{p}</option>)}
//                 </select>
//               </div>
//               <div style={{ gridColumn: 'span 2' }}>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Image URL *</label>
//                 <input className="input" placeholder="https://image.cdn.../banner.jpg" value={form.imageUrl} required
//                   onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={{ fontSize: 13 }} />
//               </div>
//               <div style={{ gridColumn: 'span 2' }}>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Link URL</label>
//                 <input className="input" placeholder="https://... or /categories/farm-equipments" value={form.linkUrl}
//                   onChange={e => setForm({ ...form, linkUrl: e.target.value })} style={{ fontSize: 13 }} />
//               </div>
//               <div>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Sort Order</label>
//                 <input className="input" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} style={{ fontSize: 13 }} />
//               </div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
//                 <input type="checkbox" id="bannerActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: 16, height: 16 }} />
//                 <label htmlFor="bannerActive" style={{ fontSize: 13, fontWeight: 600 }}>Active (visible to customers)</label>
//               </div>
//               <div>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Show From</label>
//                 <input className="input" type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} style={{ fontSize: 13 }} />
//               </div>
//               <div>
//                 <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Show Until</label>
//                 <input className="input" type="datetime-local" value={form.endsAt} onChange={e => setForm({ ...form, endsAt: e.target.value })} style={{ fontSize: 13 }} />
//               </div>
//             </div>
//             {form.imageUrl && (
//               <div style={{ marginBottom: 16 }}>
//                 <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Preview:</p>
//                 <img src={form.imageUrl} alt="Preview" style={{ maxHeight: 160, borderRadius: 10, border: '1px solid #e5e7eb', display: 'block' }} onError={e => e.target.style.display = 'none'} />
//               </div>
//             )}
//             <div style={{ display: 'flex', gap: 10 }}>
//               <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : 'Create Banner'}</button>
//               <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
//         {loading
//           ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />)
//           : banners.map(b => (
//             <div key={b.id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: b.isActive ? '1px solid #e5e7eb' : '2px solid #FEE2E2' }}>
//               <div style={{ height: 160, overflow: 'hidden', background: '#f9fafb', position: 'relative' }}>
//                 <img src={b.imageUrl} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6 }}>
//                   <span style={{ background: '#1B5E20', color: 'white', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{b.position}</span>
//                   <span style={{ background: b.isActive ? '#16A34A' : '#DC2626', color: 'white', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{b.isActive ? 'Active' : 'Hidden'}</span>
//                 </div>
//               </div>
//               <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div>
//                   <p style={{ fontWeight: 700, fontSize: 14 }}>{b.title || 'Untitled Banner'}</p>
//                   <p style={{ fontSize: 11, color: '#9CA3AF' }}>Sort: {b.sortOrder}</p>
//                 </div>
//                 <div style={{ display: 'flex', gap: 6 }}>
//                   <button onClick={() => handleToggle(b)} className="btn btn-outline btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
//                     {b.isActive ? 'Hide' : 'Show'}
//                   </button>
//                   <button onClick={() => handleDelete(b.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
//                     <Trash2 style={{ width: 14, color: '#DC2626' }} />
//                   </button>
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
import {
  Plus, Trash2, Edit2, X, Image as ImageIcon,
  ToggleRight, ToggleLeft, Link as LinkIcon, Calendar,
  Layers, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ImageUploader from '@/components/admin/ImageUploader';

const POSITIONS = [
  { value: 'hero',         label: 'Hero Carousel (Homepage top)' },
  { value: 'banner2',      label: 'Secondary Banner' },
  { value: 'category_top', label: 'Category Page Top' },
  { value: 'sidebar',      label: 'Sidebar' },
  { value: 'popup',        label: 'Popup / Offer' },
];

const EMPTY = {
  image: '', title: '', linkUrl: '',
  position: 'hero', sortOrder: 0,
  isActive: true, startsAt: '', endsAt: '',
  // popup-specific
  subtitle: '', buttonText: '', bgColor: '#1B3C2B',
  textColor: '#ffffff', overlayOpacity: 0.65, popupDelay: 1,
};

function BannerSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-4">
      <div className="w-32 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}

/* Live miniature popup preview shown inside the form */
function PopupPreview({ form }) {
  const bg = form.bgColor || '#1B3C2B';
  const textColor = form.textColor || '#ffffff';
  const hasText = form.title || form.subtitle || form.buttonText;
  return (
    <div className="rounded-xl overflow-hidden border-2 border-dashed border-purple-200 bg-gray-800 p-3">
      <p className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wide">Live Popup Preview</p>
      {/* Simulated dark overlay backdrop */}
      <div className="relative rounded-xl overflow-hidden" style={{ background: `rgba(0,0,0,${form.overlayOpacity ?? 0.65})` }}>
        <div
          className="relative rounded-xl overflow-hidden shadow-xl mx-auto"
          style={{ background: bg, maxWidth: 340 }}
        >
          {/* fake close btn */}
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center z-10">
            <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>×</span>
          </div>
          {form.image ? (
            <img
              src={form.image}
              alt="popup preview"
              className="w-full h-auto block"
              style={{ maxHeight: hasText ? 180 : 260, objectFit: 'cover' }}
            />
          ) : (
            <div className="w-full flex items-center justify-center py-10" style={{ color: textColor, opacity: 0.3 }}>
              <div className="text-center">
                <div className="text-4xl mb-1">🖼️</div>
                <p className="text-xs">Upload image to preview</p>
              </div>
            </div>
          )}
          {hasText && (
            <div className="px-4 py-3 text-center">
              {form.title && (
                <p className="font-extrabold text-sm leading-tight mb-1" style={{ color: textColor }}>
                  {form.title}
                </p>
              )}
              {form.subtitle && (
                <p className="text-xs mb-2" style={{ color: textColor, opacity: 0.85 }}>
                  {form.subtitle}
                </p>
              )}
              {(form.linkUrl || form.buttonText) && (
                <span
                  className="inline-flex items-center gap-1 font-bold text-xs px-4 py-1.5 rounded-full"
                  style={{ background: textColor, color: bg }}
                >
                  {form.buttonText || 'Shop Now'} →
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-2">
        Appears after <strong>{form.popupDelay ?? 1}s</strong> · overlay {Math.round((form.overlayOpacity ?? 0.65) * 100)}% dark · up to 680px wide
      </p>
    </div>
  );
}

export default function AdminBannersPage() {
  const [banners,  setBanners]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners/admin/all');
      setBanners(res.data.data || []);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image) { toast.error('Please upload a banner image'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        sortOrder: parseInt(form.sortOrder) || 0,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      };
      if (editId) {
        await api.put(`/banners/${editId}`, payload);
        toast.success('Banner updated!');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner created!');
      }
      setShowForm(false); setEditId(null); setForm(EMPTY);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleEdit = (b) => {
    setForm({
      image: b.image || '',
      title: b.title || '',
      linkUrl: b.linkUrl || '',
      position: b.position || 'hero',
      sortOrder: b.sortOrder ?? 0,
      isActive: b.isActive ?? true,
      startsAt: b.startsAt ? b.startsAt.slice(0, 16) : '',
      endsAt: b.endsAt ? b.endsAt.slice(0, 16) : '',
      // popup-specific
      subtitle: b.subtitle || '',
      buttonText: b.buttonText || '',
      bgColor: b.bgColor || '#1B3C2B',
      textColor: b.textColor || '#ffffff',
      overlayOpacity: b.overlayOpacity ?? 0.65,
      popupDelay: b.popupDelay ?? 1,
    });
    setEditId(b.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (b) => {
    try {
      await api.put(`/banners/${b.id}`, { ...b, isActive: !b.isActive });
      fetchBanners();
    } catch { toast.error('Failed'); }
  };

  const posLabel = (val) => POSITIONS.find(p => p.value === val)?.label || val;
  const active   = banners.filter(b => b.isActive).length;
  const inactive = banners.filter(b => !b.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="font-bold text-green-700">{active}</span> active ·{' '}
            <span className="font-bold text-gray-500">{inactive}</span> hidden
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-bold text-sm rounded-xl transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', val: banners.length, bg: 'bg-white',      color: 'text-gray-900' },
          { label: 'Active', val: active,         bg: 'bg-green-50',   color: 'text-green-700' },
          { label: 'Hidden', val: inactive,        bg: 'bg-gray-100',   color: 'text-gray-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 p-4 text-center`}>
            <p className={`font-heading font-extrabold text-2xl ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Banners list ── */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <BannerSkeleton key={i} />)}</div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">No banners yet</h3>
          <p className="text-gray-400 text-sm mb-5">Add your first banner to display on the homepage</p>
          <button
            onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}
            className="px-6 py-2.5 bg-primary-900 text-white font-bold text-sm rounded-xl hover:bg-primary-800 transition-colors"
          >
            Add First Banner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className={`bg-white rounded-2xl border transition-all hover:shadow-sm ${b.isActive ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-70'}`}>
              <div className="flex items-center gap-4 p-4">
                {/* Preview */}
                <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  {b.image
                    ? <img src={b.image} alt={b.title || 'Banner'} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate mb-1">{b.title || '(No title)'}</p>
                  <div className="flex flex-wrap gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      b.position === 'popup' ? 'bg-purple-100 text-purple-700' : 'bg-primary-50 text-primary-900'
                    }`}>
                      {b.position === 'popup' ? '🎯 ' : ''}{posLabel(b.position)}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {b.isActive ? '● Active' : '○ Hidden'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Order: {b.sortOrder}</span>
                    {b.position === 'popup' && b.popupDelay != null && (
                      <span className="text-xs text-purple-500 font-medium">Delay: {b.popupDelay}s</span>
                    )}
                  </div>
                  {b.subtitle && (
                    <p className="text-xs text-gray-500 truncate mb-0.5 italic">{b.subtitle}</p>
                  )}
                  {b.linkUrl && (
                    <p className="flex items-center gap-1 text-xs text-blue-500 truncate">
                      <LinkIcon className="w-3 h-3 flex-shrink-0" /> {b.linkUrl}
                    </p>
                  )}
                  {(b.startsAt || b.endsAt) && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {b.startsAt ? new Date(b.startsAt).toLocaleDateString('en-IN') : '∞'}
                      {' → '}
                      {b.endsAt ? new Date(b.endsAt).toLocaleDateString('en-IN') : '∞'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(b)} title={b.isActive ? 'Deactivate' : 'Activate'} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
                    {b.isActive
                      ? <ToggleRight className="w-5 h-5 text-green-600" />
                      : <ToggleLeft className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                  <button onClick={() => handleEdit(b)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl w-full max-w-lg my-4 overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-gray-900">
                  {editId ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Upload image and configure display settings</p>
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

              {/* Banner image */}
              <ImageUploader
                endpoint="banner"
                value={form.image}
                onChange={url => setForm(f => ({ ...f, image: url }))}
                label="Banner Image"
                hint={form.position === 'popup' ? 'Recommended: 600×400px' : 'Recommended: 1920×600px'}
                required
              />

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Banner Title</label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                  placeholder="e.g. Summer Sale — Up to 40% Off"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Click Link URL</label>
                <input
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                  placeholder="/products or /categories/sprayers"
                  value={form.linkUrl}
                  onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                />
              </div>

              {/* Position + Sort order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Position</label>
                  <select
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none bg-white transition-colors"
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  >
                    {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Sort Order</label>
                  <input
                    type="number" min="0"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-primary-900 focus:outline-none transition-colors"
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                  />
                </div>
              </div>

              {/* ── POPUP-SPECIFIC SECTION ── */}
              {form.position === 'popup' && (
                <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-extrabold text-purple-800">Popup Settings</p>
                    <span className="ml-auto text-[10px] bg-purple-200 text-purple-700 font-bold px-2 py-0.5 rounded-full uppercase">Popup Only</span>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Subtitle / Description</label>
                    <input
                      className="w-full px-4 py-2.5 border-2 border-purple-200 bg-white rounded-xl text-sm font-medium focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="e.g. Limited time offer for all farmers"
                      value={form.subtitle}
                      onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                    />
                  </div>

                  {/* Button text */}
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">CTA Button Text</label>
                    <input
                      className="w-full px-4 py-2.5 border-2 border-purple-200 bg-white rounded-xl text-sm font-medium focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="e.g. Shop Now  (leave blank to hide button)"
                      value={form.buttonText}
                      onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                    />
                    <p className="text-[11px] text-purple-500 mt-1">Button only shows if a Click Link URL is also set.</p>
                  </div>

                  {/* BG colour + Text colour */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Background Colour</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.bgColor}
                          onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border-2 border-purple-200 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          className="flex-1 px-3 py-2 border-2 border-purple-200 bg-white rounded-xl text-sm font-mono focus:border-purple-500 focus:outline-none"
                          value={form.bgColor}
                          onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                          placeholder="#1B3C2B"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">Text Colour</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.textColor}
                          onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border-2 border-purple-200 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          className="flex-1 px-3 py-2 border-2 border-purple-200 bg-white rounded-xl text-sm font-mono focus:border-purple-500 focus:outline-none"
                          value={form.textColor}
                          onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Overlay opacity + Popup delay */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">
                        Overlay Darkness <span className="normal-case font-normal text-purple-500">({Math.round((form.overlayOpacity ?? 0.65) * 100)}%)</span>
                      </label>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={form.overlayOpacity ?? 0.65}
                        onChange={e => setForm(f => ({ ...f, overlayOpacity: parseFloat(e.target.value) }))}
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between text-[10px] text-purple-400 mt-0.5">
                        <span>0% (clear)</span><span>100% (black)</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-700 mb-1.5 uppercase tracking-wide">
                        Popup Delay (seconds)
                      </label>
                      <input
                        type="number" min="0" max="30"
                        className="w-full px-4 py-2.5 border-2 border-purple-200 bg-white rounded-xl text-sm font-medium focus:border-purple-500 focus:outline-none"
                        value={form.popupDelay ?? 1}
                        onChange={e => setForm(f => ({ ...f, popupDelay: parseInt(e.target.value) || 0 }))}
                      />
                      <p className="text-[11px] text-purple-500 mt-1">0 = show instantly on page load</p>
                    </div>
                  </div>

                  {/* Live preview */}
                  <PopupPreview form={form} />
                </div>
              )}

              {/* Schedule */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Schedule (optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Show From</p>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none transition-colors"
                      value={form.startsAt}
                      onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Show Until</p>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none transition-colors"
                      value={form.endsAt}
                      onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {form.isActive ? 'Active — visible on site' : 'Hidden — not shown on site'}
                  </p>
                  <p className="text-xs text-gray-400">Toggle to show or hide this banner</p>
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
                    : editId ? 'Update Banner' : 'Add Banner'
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

