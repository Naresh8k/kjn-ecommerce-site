'use client';
import { useEffect, useState } from 'react';
import { Plus, Layers, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCollection, setEditCollection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const emptyForm = { name: '', slug: '', description: '', imageUrl: '', isActive: true, sortOrder: '0' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchCollections(); }, []);

  const fetchCollections = async () => {
    try { const res = await api.get('/collections'); setCollections(res.data.data || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder || 0), slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') };
      if (editCollection) {
        await api.put(`/collections/${editCollection.id}`, payload);
        toast.success('Collection updated!');
      } else {
        await api.post('/collections', payload);
        toast.success('Collection created!');
      }
      setShowForm(false); setEditCollection(null); setForm(emptyForm); fetchCollections();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (col) => {
    setForm({ name: col.name, slug: col.slug, description: col.description || '', imageUrl: col.imageUrl || '', isActive: col.isActive, sortOrder: String(col.sortOrder || 0) });
    setEditCollection(col); setShowForm(true); window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this collection?')) return;
    try { await api.delete(`/collections/${id}`); toast.success('Deleted!'); fetchCollections(); }
    catch { toast.error('Failed'); }
  };

  const handleViewProducts = async (col) => {
    setActiveCollection(col);
    try {
      const res = await api.get(`/collections/${col.slug}`);
      setCollectionProducts(res.data.data || []);
    } catch { setCollectionProducts([]); }
  };

  const searchProducts = async (q) => {
    if (!q.trim()) { setProductResults([]); return; }
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(q)}&limit=10`);
      setProductResults(res.data.data || []);
    } catch { }
  };

  const addProductToCollection = async (productId) => {
    try {
      await api.post(`/collections/${activeCollection.id}/products`, { productId });
      toast.success('Product added to collection!');
      handleViewProducts(activeCollection);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const removeProductFromCollection = async (productId) => {
    try {
      await api.delete(`/collections/${activeCollection.id}/products/${productId}`);
      toast.success('Product removed');
      handleViewProducts(activeCollection);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Collections <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({collections.length})</span></h2>
        <button onClick={() => { setShowForm(!showForm); setEditCollection(null); setForm(emptyForm); }} className="btn btn-primary btn-sm">
          <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'New Collection'}
        </button>
      </div>

      {/* Info */}
      <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1B5E20', fontWeight: 600 }}>
        💡 Collections are product groups shown on the homepage — like "New Launch", "Fans", "Best Sellers", "Shop by Brand" etc.
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{editCollection ? 'Edit Collection' : 'Create New Collection'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Collection Name *</label>
                <input className="input" placeholder="e.g. New Launch, Fans, Best Sellers" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Slug</label>
                <input className="input" placeholder="new-launch (auto if empty)" value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Description</label>
                <input className="input" placeholder="Short description of this collection" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Cover Image URL</label>
                <input className="input" placeholder="https://..." value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Sort Order</label>
                <input className="input" type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="colActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: 16, height: 16 }} />
                <label htmlFor="colActive" style={{ fontSize: 13, fontWeight: 600 }}>Active (show on website)</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Saving...' : editCollection ? 'Update' : 'Create Collection'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditCollection(null); setForm(emptyForm); }} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {loading
          ? Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 14 }} />)
          : collections.map(col => (
            <div key={col.id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              {col.imageUrl && (
                <div style={{ height: 80, overflow: 'hidden', background: '#f9fafb' }}>
                  <img src={col.imageUrl} alt={col.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{col.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>/{col.slug}</p>
                  </div>
                  <span style={{ background: col.isActive ? '#E8F5E9' : '#f3f4f6', color: col.isActive ? '#1B5E20' : '#9CA3AF', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {col.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                {col.description && <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{col.description}</p>}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleViewProducts(col)}
                    className="btn btn-outline btn-sm" style={{ flex: 1, fontSize: 11, padding: '6px 8px' }}>
                    <Package style={{ width: 12 }} /> Manage Products
                  </button>
                  <button onClick={() => handleEdit(col)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Edit2 style={{ width: 12 }} />
                  </button>
                  <button onClick={() => handleDelete(col.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 style={{ width: 12, color: '#DC2626' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Manage Products Modal */}
      {activeCollection && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 17 }}>{activeCollection.name}</h3>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{collectionProducts.length} products in this collection</p>
              </div>
              <button onClick={() => setActiveCollection(null)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Add Product to Collection</label>
              <input className="input" placeholder="Search product name..." value={productSearch}
                onChange={e => { setProductSearch(e.target.value); searchProducts(e.target.value); }}
                style={{ fontSize: 13, marginBottom: 8 }} />
              {productResults.length > 0 && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
                  {productResults.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseOut={e => e.currentTarget.style.background = 'white'}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      <button onClick={() => { addProductToCollection(p.id); setProductSearch(''); setProductResults([]); }}
                        style={{ padding: '4px 12px', borderRadius: 99, border: 'none', background: '#E8F5E9', color: '#1B5E20', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Products in Collection</p>
              {collectionProducts.length === 0
                ? <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No products yet. Search above to add products.</p>
                : collectionProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                    {p.image
                      ? <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package style={{ width: 18, color: '#1B5E20' }} />
                        </div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: '#1B5E20', fontWeight: 700 }}>₹{parseFloat(p.sellingPrice).toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => removeProductFromCollection(p.id)}
                      style={{ padding: '4px 10px', borderRadius: 99, border: '1px solid #FEE2E2', background: 'white', color: '#DC2626', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}