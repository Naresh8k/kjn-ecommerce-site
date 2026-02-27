'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [newStock, setNewStock] = useState('');

  const emptyForm = { name: '', slug: '', sku: '', description: '', shortDescription: '', categoryId: '', brandId: '', mrp: '', sellingPrice: '', gstPercent: '18', stockQuantity: '0', isFeatured: false, tags: '', weightGrams: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then(r => setCategories(r.data.data || []));
    api.get('/brands').then(r => setBrands(r.data.data || []));
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        mrp: parseFloat(form.mrp),
        sellingPrice: parseFloat(form.sellingPrice),
        gstPercent: parseFloat(form.gstPercent),
        stockQuantity: parseInt(form.stockQuantity),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        weightGrams: form.weightGrams ? parseInt(form.weightGrams) : null,
        brandId: form.brandId || null,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };

      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      setShowForm(false);
      setEditProduct(null);
      setForm(emptyForm);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, slug: p.slug, sku: p.sku || '', description: p.description || '',
      shortDescription: p.shortDescription || '', categoryId: p.categoryId || '',
      brandId: p.brandId || '', mrp: p.mrp, sellingPrice: p.sellingPrice,
      gstPercent: p.gstPercent || '18', stockQuantity: p.stockQuantity || 0,
      isFeatured: p.isFeatured || false, tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      weightGrams: p.weightGrams || '',
    });
    setEditProduct(p);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const handleUpdateStock = async () => {
    if (!newStock || isNaN(newStock)) { toast.error('Enter valid stock number'); return; }
    try {
      await api.put(`/admin/products/${stockModal.id}/stock`, { stockQuantity: parseInt(newStock) });
      toast.success('Stock updated!');
      setProducts(prev => prev.map(p => p.id === stockModal.id ? { ...p, stockQuantity: parseInt(newStock) } : p));
      setStockModal(null); setNewStock('');
    } catch { toast.error('Failed to update stock'); }
  };

  const fields = [
    [{ key: 'name', label: 'Product Name *', placeholder: 'Full product name', full: true }],
    [{ key: 'slug', label: 'Slug (auto-generated)', placeholder: 'product-slug' }, { key: 'sku', label: 'SKU', placeholder: 'PROD-001' }],
    [{ key: 'mrp', label: 'MRP (₹) *', placeholder: '0.00', type: 'number' }, { key: 'sellingPrice', label: 'Selling Price (₹) *', placeholder: '0.00', type: 'number' }],
    [{ key: 'gstPercent', label: 'GST %', placeholder: '18', type: 'number' }, { key: 'stockQuantity', label: 'Stock Quantity', placeholder: '0', type: 'number' }],
    [{ key: 'weightGrams', label: 'Weight (grams)', placeholder: '500', type: 'number' }, { key: 'tags', label: 'Tags (comma separated)', placeholder: 'sprayer, farming, tool' }],
    [{ key: 'shortDescription', label: 'Short Description', placeholder: 'Brief product summary', full: true }],
    [{ key: 'description', label: 'Full Description', placeholder: 'Detailed product description...', full: true, textarea: true }],
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Products <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({total})</span></h2>
        <button onClick={() => { setShowForm(!showForm); setEditProduct(null); setForm(emptyForm); }} className="btn btn-primary btn-sm">
          <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            {/* Category & Brand */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Category *</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>Brand</label>
                <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                  <option value="">No Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            {fields.map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: row[0].full ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {row.map(({ key, label, placeholder, type = 'text', full, textarea }) => (
                  <div key={key} style={{ gridColumn: full ? 'span 1' : 'span 1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>{label}</label>
                    {textarea
                      ? <textarea className="input" placeholder={placeholder} value={form[key]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          style={{ minHeight: 100, resize: 'vertical', fontSize: 13 }} />
                      : <input className="input" type={type} placeholder={placeholder} value={form[key]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          style={{ fontSize: 13 }} required={label.includes('*')} />}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="isFeatured" checked={form.isFeatured}
                onChange={e => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 16, height: 16 }} />
              <label htmlFor="isFeatured" style={{ fontSize: 13, fontWeight: 600 }}>Mark as Featured Product</label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditProduct(null); setForm(emptyForm); }} className="btn btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ background: 'white', borderRadius: 14, padding: '14px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, color: '#9CA3AF' }} />
          <input className="input" style={{ paddingLeft: 38, fontSize: 13 }} placeholder="Search products..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                {['Product', 'Category', 'MRP', 'Price', 'Discount', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={8} style={{ padding: '12px 14px' }}><div className="skeleton" style={{ height: 20, borderRadius: 4 }} /></td></tr>
                ))
                : products.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No products found</td></tr>
                  : products.map(p => {
                    const discount = Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {p.image
                              ? <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                              : <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package style={{ width: 18, color: '#1B5E20' }} /></div>}
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 180 }}>{p.name}</p>
                              {p.sku && <p style={{ fontSize: 10, color: '#9CA3AF' }}>SKU: {p.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280' }}>{p.category?.name}</td>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{parseFloat(p.mrp).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#1B5E20' }}>₹{parseFloat(p.sellingPrice).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 14px' }}>
                          {discount > 0 && <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{discount}% off</span>}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button onClick={() => { setStockModal(p); setNewStock(String(p.stockQuantity)); }}
                            style={{ background: p.stockQuantity === 0 ? '#FEF2F2' : p.stockQuantity <= 5 ? '#FFF8E1' : '#E8F5E9', color: p.stockQuantity === 0 ? '#DC2626' : p.stockQuantity <= 5 ? '#F59E0B' : '#1B5E20', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                            {p.stockQuantity === 0 ? 'Out' : `${p.stockQuantity} pcs`}
                          </button>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: p.isActive !== false ? '#E8F5E9' : '#FEF2F2', color: p.isActive !== false ? '#16A34A' : '#DC2626', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                            {p.isActive !== false ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleEdit(p)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Edit2 style={{ width: 14, color: '#374151' }} />
                            </button>
                            <button onClick={() => handleDelete(p.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <Trash2 style={{ width: 14, color: '#DC2626' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {total > 15 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px' }}>
            {Array(Math.ceil(total / 15)).fill(0).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid', borderColor: page === i + 1 ? '#1B5E20' : '#e5e7eb', background: page === i + 1 ? '#1B5E20' : 'white', color: page === i + 1 ? 'white' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {stockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Update Stock</h3>
            <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{stockModal.name}</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>New Stock Quantity</label>
              <input className="input" type="number" min="0" value={newStock} onChange={e => setNewStock(e.target.value)} autoFocus />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleUpdateStock} className="btn btn-primary" style={{ flex: 1 }}>Update Stock</button>
              <button onClick={() => { setStockModal(null); setNewStock(''); }} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}