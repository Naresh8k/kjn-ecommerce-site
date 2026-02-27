'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Eye, Edit2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const statusColors = {
  PENDING: '#F59E0B', CONFIRMED: '#16A34A', PROCESSING: '#2563EB',
  SHIPPED: '#059669', OUT_FOR_DELIVERY: '#EA580C', DELIVERED: '#1B5E20',
  CANCELLED: '#DC2626', RETURNED: '#7C3AED', REFUNDED: '#7C3AED',
};

const allStatuses = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED','REFUNDED'];

function OrdersContent() {
  const searchParams = useSearchParams();
  const initStatus = searchParams.get('status') || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initStatus);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/orders/admin/all?${params}`);
      setOrders(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, status, trackingId = '', awbNumber = '') => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status, trackingId, awbNumber });
      toast.success('Order status updated!');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setSelectedOrder(null);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const filtered = orders.filter(o =>
    !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.phone?.includes(search)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20 }}>Orders <span style={{ color: '#6B7280', fontWeight: 600, fontSize: 14 }}>({total})</span></h2>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, color: '#9CA3AF' }} />
          <input className="input" style={{ paddingLeft: 38, fontSize: 13 }} placeholder="Search order#, customer, phone..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 13, minWidth: 160 }}>
          <option value="">All Status</option>
          {allStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{ padding: '6px 14px', borderRadius: 99, border: '2px solid', borderColor: statusFilter === s ? '#1B5E20' : '#e5e7eb', background: statusFilter === s ? '#1B5E20' : 'white', color: statusFilter === s ? 'white' : '#6B7280', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={8} style={{ padding: '12px 14px' }}><div className="skeleton" style={{ height: 20, borderRadius: 4 }} /></td></tr>
                ))
                : filtered.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>No orders found</td></tr>
                  : filtered.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#1B5E20' }}>#{order.orderNumber}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{order.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{order.user?.phone}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#6B7280' }}>{order.items?.length} items</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#1F2937' }}>
                        ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: order.paymentStatus === 'PAID' ? '#E8F5E9' : '#FFF8E1', color: order.paymentStatus === 'PAID' ? '#16A34A' : '#F59E0B', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                          {order.paymentStatus}
                        </span>
                        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{order.paymentMethod}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: `${statusColors[order.status]}20`, color: statusColors[order.status], padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => setSelectedOrder(order)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#374151' }}>
                          <Edit2 style={{ width: 12 }} /> Update
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Update Status Modal */}
      {selectedOrder && (
        <UpdateOrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={handleStatusUpdate} updating={updatingId === selectedOrder.id} />
      )}
    </div>
  );
}

function UpdateOrderModal({ order, onClose, onUpdate, updating }) {
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [awbNumber, setAwbNumber] = useState(order.awbNumber || '');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Update Order</h3>
        <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>#{order.orderNumber} · {order.user?.name}</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Order Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 14 }}>
            {allStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        {['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>AWB Number (Tracking)</label>
              <input className="input" placeholder="e.g. 1234567890" value={awbNumber} onChange={e => setAwbNumber(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#374151' }}>Shipmozo Tracking ID</label>
              <input className="input" placeholder="Shipmozo order ID" value={trackingId} onChange={e => setTrackingId(e.target.value)} />
            </div>
          </>
        )}

        {/* Order Summary */}
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Total Amount</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1B5E20' }}>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Payment</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{order.paymentMethod} · {order.paymentStatus}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onUpdate(order.id, status, trackingId, awbNumber)} disabled={updating}
            className="btn btn-primary" style={{ flex: 1 }}>
            {updating ? 'Updating...' : 'Update Status'}
          </button>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense><OrdersContent /></Suspense>;
}