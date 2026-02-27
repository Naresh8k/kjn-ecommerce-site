'use client';
import { useEffect, useState } from 'react';
import { Search, Users, Phone, Mail, Eye, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    try {
      const res = await api.get(`/admin/users/${user.id}/orders`);
      setUserOrders(res.data.data || []);
    } catch { setUserOrders([]); }
    finally { setLoadingOrders(false); }
  };

  const statusColors = {
    DELIVERED: '#1B5E20', PENDING: '#F59E0B', CANCELLED: '#DC2626',
    SHIPPED: '#059669', CONFIRMED: '#16A34A', PROCESSING: '#2563EB',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>
          Customers <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({total})</span>
        </h2>
      </div>

      {/* Search */}
      <div style={{ background: 'white', borderRadius: 14, padding: '14px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, color: '#9CA3AF' }} />
          <input className="input" style={{ paddingLeft: 38, fontSize: 13 }}
            placeholder="Search by name, phone, email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                {['Customer', 'Phone', 'Email', 'Joined', 'Orders', 'Total Spent', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={7} style={{ padding: '12px 14px' }}>
                    <div className="skeleton" style={{ height: 20, borderRadius: 4 }} />
                  </td></tr>
                ))
                : users.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No customers found</td></tr>
                  : users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</p>
                            <p style={{ fontSize: 10, color: u.role === 'ADMIN' ? '#1B5E20' : '#9CA3AF', fontWeight: 700 }}>{u.role}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{u.phone}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280' }}>{u.email || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                          {u._count?.orders || 0}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'Sora', fontWeight: 700, fontSize: 13, color: '#1B5E20' }}>
                        ₹{(u.totalSpent || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => handleViewUser(u)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          <Eye style={{ width: 12 }} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px' }}>
            {Array(Math.ceil(total / 20)).fill(0).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid', borderColor: page === i + 1 ? '#1B5E20' : '#e5e7eb', background: page === i + 1 ? '#1B5E20' : 'white', color: page === i + 1 ? 'white' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 0 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 480, height: '100vh', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18 }}>Customer Details</h3>
              <button onClick={() => setSelectedUser(null)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '20px', background: 'linear-gradient(135deg,#E8F5E9,#F1F8E9)', borderRadius: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 22, flexShrink: 0 }}>
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18 }}>{selectedUser.name}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                      <Phone style={{ width: 13 }} /> {selectedUser.phone}
                    </div>
                    {selectedUser.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                        <Mail style={{ width: 13 }} /> {selectedUser.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Total Orders', val: selectedUser._count?.orders || 0 },
                  { label: 'Total Spent', val: `₹${(selectedUser.totalSpent || 0).toLocaleString('en-IN')}` },
                  { label: 'Joined', val: new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: '#f9fafb', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 16, color: '#1B5E20' }}>{val}</p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Orders */}
              <h4 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Order History</h4>
              {loadingOrders
                ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 10 }} />)}
                  </div>
                : userOrders.length === 0
                  ? <p style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
                  : userOrders.map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', borderRadius: 10, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>#{o.orderNumber}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#1B5E20' }}>₹{parseFloat(o.totalAmount).toLocaleString('en-IN')}</p>
                        <span style={{ background: `${statusColors[o.status] || '#9CA3AF'}20`, color: statusColors[o.status] || '#9CA3AF', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}