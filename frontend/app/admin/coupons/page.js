'use client';
import { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', type: 'PERCENT', value: '', minOrderAmount: '0',
    maxDiscount: '', usesLimit: '', perUserLimit: '1',
    validFrom: '', validUntil: '',
  });

  useEffect(() => {
    api.get('/coupons').then(r => setCoupons(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.post('/coupons', form);
      toast.success('Coupon created!');
      setCoupons(prev => [...prev, res.data.data]);
      setForm({ code: '', type: 'PERCENT', value: '', minOrderAmount: '0', maxDiscount: '', usesLimit: '', perUserLimit: '1', validFrom: '', validUntil: '' });
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/coupons/${id}/toggle`);
      setCoupons(prev => prev.map(c => c.id === id ? res.data.data : c));
      toast.success('Coupon toggled!');
    } catch { toast.error('Failed'); }
  };

  const typeColors = { PERCENT: { bg: '#EFF6FF', color: '#2563EB' }, FLAT: { bg: '#F0FDF4', color: '#16A34A' }, FREE_SHIPPING: { bg: '#FFF8E1', color: '#F59E0B' } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Coupons <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({coupons.length})</span></h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus style={{ width: 16 }} /> {showForm ? 'Cancel' : 'Add Coupon'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Create New Coupon</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Coupon Code *</label>
                <input className="input" placeholder="SAVE20" value={form.code} required
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Discount Type *</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13 }}>
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Value {form.type === 'PERCENT' ? '(%)' : '(₹)'} *</label>
                <input className="input" type="number" placeholder={form.type === 'PERCENT' ? '20' : '100'} value={form.value} required
                  onChange={e => setForm({ ...form, value: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Min Order Amount (₹)</label>
                <input className="input" type="number" placeholder="0" value={form.minOrderAmount}
                  onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              {form.type === 'PERCENT' && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Max Discount (₹)</label>
                  <input className="input" type="number" placeholder="500" value={form.maxDiscount}
                    onChange={e => setForm({ ...form, maxDiscount: e.target.value })} style={{ fontSize: 13 }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Total Uses Limit</label>
                <input className="input" type="number" placeholder="Unlimited" value={form.usesLimit}
                  onChange={e => setForm({ ...form, usesLimit: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Per User Limit</label>
                <input className="input" type="number" placeholder="1" value={form.perUserLimit}
                  onChange={e => setForm({ ...form, perUserLimit: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Valid From</label>
                <input className="input" type="datetime-local" value={form.validFrom}
                  onChange={e => setForm({ ...form, validFrom: e.target.value })} style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Valid Until</label>
                <input className="input" type="datetime-local" value={form.validUntil}
                  onChange={e => setForm({ ...form, validUntil: e.target.value })} style={{ fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Creating...' : 'Create Coupon'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {loading
          ? Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />)
          : coupons.map(c => {
            const tc = typeColors[c.type] || {};
            const expired = c.validUntil && new Date(c.validUntil) < new Date();
            return (
              <div key={c.id} style={{ background: 'white', borderRadius: 14, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${c.isActive && !expired ? '#e5e7eb' : '#FEE2E2'}`, opacity: c.isActive && !expired ? 1 : 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>{c.code}</span>
                      <span style={{ background: tc.bg, color: tc.color, padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{c.type}</span>
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#1B5E20' }}>
                      {c.type === 'PERCENT' ? `${c.value}% OFF` : c.type === 'FLAT' ? `₹${c.value} OFF` : 'FREE SHIPPING'}
                    </p>
                  </div>
                  <button onClick={() => handleToggle(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.isActive ? '#1B5E20' : '#9CA3AF' }}>
                    {c.isActive ? <ToggleRight style={{ width: 32, height: 32 }} /> : <ToggleLeft style={{ width: 32, height: 32 }} />}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {parseFloat(c.minOrderAmount) > 0 && <span>Min order: ₹{c.minOrderAmount}</span>}
                  {c.maxDiscount && <span>Max discount: ₹{c.maxDiscount}</span>}
                  <span>Used: {c.usesCount}{c.usesLimit ? `/${c.usesLimit}` : ''} times</span>
                  {c.validUntil && <span style={{ color: expired ? '#DC2626' : '#6B7280' }}>Expires: {new Date(c.validUntil).toLocaleDateString('en-IN')}{expired ? ' (Expired)' : ''}</span>}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}