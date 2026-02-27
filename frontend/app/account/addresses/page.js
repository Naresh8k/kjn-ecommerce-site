'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function AddressesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: 'Andhra Pradesh', pincode: '', isDefault: false });

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
    try {
      await api.delete(`/user/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (addr) => {
    setForm({ name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', line1: '', line2: '', city: '', state: 'Andhra Pradesh', pincode: '', isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Recipient name', full: false },
    { key: 'phone', label: 'Phone', placeholder: '10-digit mobile', full: false },
    { key: 'line1', label: 'Address Line 1', placeholder: 'House no, Street', full: true },
    { key: 'line2', label: 'Line 2 (Optional)', placeholder: 'Landmark, Area', full: true },
    { key: 'city', label: 'City', placeholder: 'City', full: false },
    { key: 'state', label: 'State', placeholder: 'State', full: false },
    { key: 'pincode', label: 'Pincode', placeholder: '6-digit pincode', full: false },
  ];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/account" style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft style={{ width: 16, color: '#374151' }} />
            </Link>
            <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22 }}>My Addresses</h1>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="btn btn-primary btn-sm">
            <Plus style={{ width: 14 }} /> Add New
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {fields.map(({ key, label, placeholder, full }) => (
                  <div key={key} style={{ gridColumn: full ? 'span 2' : 'span 1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>{label}</label>
                    <input className="input" placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (key === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
                        if (key === 'pincode') val = val.replace(/\D/g, '').slice(0, 6);
                        setForm({ ...form, [key]: val });
                      }}
                      required={key !== 'line2'}
                      style={{ fontSize: 13 }} />
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="isDefault" checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    style={{ width: 16, height: 16 }} />
                  <label htmlFor="isDefault" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Set as default address</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-outline btn-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
          </div>
        ) : addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16 }}>
            <MapPin style={{ width: 48, height: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No addresses saved</h3>
            <p style={{ color: '#6B7280', fontSize: 13 }}>Add an address to speed up checkout</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: addr.isDefault ? '2px solid #1B5E20' : '2px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#E8F5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin style={{ width: 18, color: '#1B5E20' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.name}</span>
                        <span style={{ fontSize: 13, color: '#6B7280' }}>· {addr.phone}</span>
                        {addr.isDefault && <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>✓ Default</span>}
                      </div>
                      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>
                        {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}<br />
                        {addr.city}, {addr.state} – {addr.pincode}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                    <button onClick={() => handleEdit(addr)}
                      style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Edit2 style={{ width: 14, color: '#374151' }} />
                    </button>
                    <button onClick={() => handleDelete(addr.id)}
                      style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 style={{ width: 14, color: '#DC2626' }} />
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