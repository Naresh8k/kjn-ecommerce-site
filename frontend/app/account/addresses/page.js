'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, Trash2, Edit2, ArrowLeft, CheckCircle, X, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const EMPTY_FORM = { name: '', phone: '', line1: '', line2: '', city: '', state: 'Andhra Pradesh', pincode: '', isDefault: false };

export default function AddressesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/user/addresses');
      setAddresses(res.data.data || []);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/user/addresses/${editingId}`, form);
        setAddresses((prev) => prev.map((a) => a.id === editingId ? res.data.data : a));
        toast.success('Address updated!');
      } else {
        const res = await api.post('/user/addresses', form);
        setAddresses((prev) => [...prev, res.data.data]);
        toast.success('Address added!');
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/user/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const handleEdit = (addr) => {
    setForm({ name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault });
    setEditingId(addr.id);
    setShowForm(true);
    setTimeout(() => document.getElementById('addr-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between" style={{ maxWidth: 640 }}>
          <div className="flex items-center gap-3">
            <Link href="/account"
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div>
              <h1 className="font-heading font-extrabold text-lg text-gray-900 leading-tight">My Addresses</h1>
              {!loading && (
                <p className="text-[11px] text-gray-400 font-semibold">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(v => !v); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-900 hover:bg-primary-800 text-white font-extrabold text-xs transition-colors shadow-primary">
            <Plus className="w-3.5 h-3.5" /> Add New
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-5" style={{ maxWidth: 640 }}>

        {/* ── Form ── */}
        {showForm && (
          <div id="addr-form" className="bg-white rounded-2xl border border-gray-100 shadow-medium p-6 mb-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button onClick={resetForm} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-600 mb-1.5">Full Name</label>
                  <input
                    value={form.name} onChange={e => setField('name', e.target.value)}
                    placeholder="Recipient name" required
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium transition-colors"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-600 mb-1.5">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile" required inputMode="numeric"
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium transition-colors"
                  />
                </div>
                {/* Line 1 */}
                <div className="col-span-2">
                  <label className="block text-xs font-extrabold text-gray-600 mb-1.5">Address Line 1</label>
                  <input
                    value={form.line1} onChange={e => setField('line1', e.target.value)}
                    placeholder="House no, Street" required
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium transition-colors"
                  />
                </div>
                {/* Line 2 */}
                <div className="col-span-2">
                  <label className="block text-xs font-extrabold text-gray-600 mb-1.5">Line 2 <span className="text-gray-400 font-semibold">(Optional)</span></label>
                  <input
                    value={form.line2} onChange={e => setField('line2', e.target.value)}
                    placeholder="Landmark, Area"
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium transition-colors"
                  />
                </div>
                {/* City */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-600 mb-1.5">City</label>
                  <input
                    value={form.city} onChange={e => setField('city', e.target.value)}
                    placeholder="City" required
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium transition-colors"
                  />
                </div>
                {/* Pincode */}
                <div>
                  <label className="block text-xs font-extrabold text-gray-600 mb-1.5">Pincode</label>
                  <input
                    value={form.pincode}
                    onChange={e => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit pincode" required inputMode="numeric"
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium transition-colors"
                  />
                </div>
                {/* State */}
                <div className="col-span-2">
                  <label className="block text-xs font-extrabold text-gray-600 mb-1.5">State</label>
                  <select
                    value={form.state} onChange={e => setField('state', e.target.value)} required
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium transition-colors bg-white">
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {/* Default checkbox */}
                <div className="col-span-2 flex items-center gap-3 bg-primary-50 rounded-xl px-4 py-3 border border-primary-100">
                  <input type="checkbox" id="isDefault" checked={form.isDefault}
                    onChange={e => setField('isDefault', e.target.checked)}
                    className="w-4 h-4 accent-primary-900 cursor-pointer" />
                  <label htmlFor="isDefault" className="text-sm font-bold text-primary-900 cursor-pointer flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" /> Set as default address
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-primary-900 hover:bg-primary-800 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><CheckCircle className="w-4 h-4" /> {editingId ? 'Update Address' : 'Save Address'}</>}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:border-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── List ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-gray-800 mb-2">No addresses saved</h3>
            <p className="text-sm text-gray-400 font-semibold mb-5">Add an address to speed up checkout</p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-900 text-white font-extrabold text-sm hover:bg-primary-800 transition-colors">
              <Plus className="w-4 h-4" /> Add First Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id}
                className={`bg-white rounded-2xl p-5 border-2 transition-all ${addr.isDefault ? 'border-primary-900 shadow-primary' : 'border-gray-100 shadow-soft'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5 text-primary-900" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-extrabold text-sm text-gray-900">{addr.name}</span>
                        <span className="text-xs text-gray-400 font-semibold">· {addr.phone}</span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-900 border border-primary-100 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                            <CheckCircle className="w-2.5 h-2.5" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                        {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}<br />
                        {addr.city}, {addr.state} – {addr.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(addr)}
                      className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} disabled={deletingId === addr.id}
                      className="w-8 h-8 rounded-xl border border-red-100 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">
                      {deletingId === addr.id
                        ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5 text-red-500" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}