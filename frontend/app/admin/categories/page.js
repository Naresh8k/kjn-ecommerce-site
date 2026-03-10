'use client';
import { useState, useEffect } from 'react';
import { Plus, Layers, Edit2, Trash2, X } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';

const emptyForm = { name: '', slug: '', image: '', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?admin=true');
      setCategories(res.data.data || []);
    } catch { toast.error('Failed to load categories'); }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, image: cat.image || '', isActive: cat.isActive });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/categories', form);
        toast.success('Category created');
      }
      closeForm();
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-2xl text-gray-900">Categories</h1>
        <button
          onClick={openCreate}
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
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
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
              <h2 className="font-heading font-bold text-lg">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-800 focus:ring-4 focus:ring-primary-100 transition-all"
                  value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="electronics (auto-generated if empty)"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Active (visible on site)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-900 shadow-primary disabled:opacity-60">
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}