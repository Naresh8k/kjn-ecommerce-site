'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, Eye, Download,
  Package, Truck, MapPin, Phone, User, X, Copy,
  Tag, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

const statusColors = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  PROCESSING: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  SHIPPED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  OUT_FOR_DELIVERY: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  RETURNED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  REFUNDED: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-500' },
};

const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];

function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status?.replace('_', ' ')}
    </span>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [counts, setCounts] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchCounts = async () => {
    try {
      const r = await api.get('/orders/admin/counts');
      setCounts(r.data.data.counts || {});
      setTotalCount(r.data.data.total || 0);
    } catch { /* silent */ }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const r = await api.get(`/orders/admin/all?${params}`);
      setOrders(r.data.data || []);
      setPagination(r.data.pagination || { total: 0, totalPages: 1 });
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCounts(); }, []);
  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, status, trackingId = '', awbNumber = '') => {
    setUpdating(true);
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status, trackingId, awbNumber });
      toast.success('Order updated');
      fetchOrders();
      fetchCounts();
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(false); }
  };

  const handleDownloadInvoice = async (orderId, orderNumber) => {
    try {
      const r = await api.get(`/orders/admin/${orderId}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `Invoice-${orderNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch { toast.error('Failed to download invoice'); }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.orderNumber?.toLowerCase().includes(s) ||
      o.user?.name?.toLowerCase().includes(s) ||
      o.user?.phone?.includes(s);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Total:</span>
          <span className="font-bold text-gray-900">{totalCount}</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[{ label: 'All', value: '' }, ...allStatuses.map(s => ({ label: s.replace('_', ' '), value: s }))].map(tab => {
          const isActive = statusFilter === tab.value;
          const c = tab.value ? statusColors[tab.value] : null;
          const tabCount = tab.value ? (counts[tab.value] || 0) : totalCount;
          return (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                isActive
                  ? (c ? `${c.bg} ${c.text} ${c.border} shadow-sm` : 'bg-gray-900 text-white border-gray-900 shadow-sm')
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.value && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? (c?.dot || 'bg-white') : 'bg-gray-300'}`} />
              )}
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                isActive ? 'bg-white/30' : 'bg-gray-100 text-gray-400'
              }`}>{tabCount}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Items</th>
                <th className="text-right px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">No orders found</td></tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelected(order)}>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-bold text-primary-700 font-mono">#{order.orderNumber}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{order.paymentMethod}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-700">{order.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{order.user?.name}</p>
                          <p className="text-[10px] text-gray-400">{order.user?.phone || order.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-extrabold text-gray-900">{RS}{fmt(order.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelected(order)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order.id, order.orderNumber)}
                          className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="w-3.5 h-3.5 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {pagination.totalPages} · {pagination.total} orders
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <OrderDetailsModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleStatusUpdate}
          onDownload={handleDownloadInvoice}
          updating={updating}
        />
      )}
    </div>
  );
}

/* ═══ Order Detail Modal ═══ */
function OrderDetailsModal({ order, onClose, onUpdate, onDownload, updating }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [awbNumber, setAwbNumber] = useState(order.awbNumber || '');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const getImg = (item) => {
    if (item.productImage) return item.productImage;
    if (item.product?.image) return item.product.image;
    if (item.product?.images?.[0]?.image) return item.product.images[0].image;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-lg text-gray-900">Order #{order.orderNumber}</h2>
              <button onClick={() => copyToClipboard(order.orderNumber)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(order.id, order.orderNumber)}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Invoice
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Payment */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} />
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {order.paymentStatus}
            </span>
            <span className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full">{order.paymentMethod}</span>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Customer
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-sm">
                {order.user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.user?.name}</p>
                <p className="text-xs text-gray-500">{order.user?.phone || order.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Shipping Address
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {order.shippingAddress.name} · {order.shippingAddress.phone}<br />
                {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
              </p>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-2">
              {order.items?.map(item => {
                const img = getImg(item);
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-14 h-14 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-100">
                      {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-3 text-gray-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                      {item.variantInfo && <p className="text-[10px] text-gray-500 mt-0.5">{item.variantInfo}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 line-through">{RS}{fmt(item.mrp)}</span>
                        <span className="text-xs font-bold text-gray-700">{RS}{fmt(item.unitPrice)} x {item.quantity}</span>
                      </div>
                    </div>
                    <p className="text-sm font-extrabold text-gray-900">{RS}{fmt(item.totalPrice)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="text-gray-700">{RS}{fmt(order.subtotal)}</span></div>
            {parseFloat(order.discountAmount) > 0 && (
              <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="text-green-600">-{RS}{fmt(order.discountAmount)}</span></div>
            )}
            <div className="flex justify-between text-sm"><span className="text-gray-500">GST</span><span className="text-gray-700">{RS}{fmt(order.gstAmount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="text-gray-700">{parseFloat(order.shippingCharge) === 0 ? 'FREE' : `${RS}${fmt(order.shippingCharge)}`}</span></div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-extrabold text-lg text-gray-900">{RS}{fmt(order.totalAmount)}</span>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${newStatus === s
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            {(newStatus === 'SHIPPED' || newStatus === 'OUT_FOR_DELIVERY') && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Tracking ID"
                  value={trackingId}
                  onChange={e => setTrackingId(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  placeholder="AWB Number"
                  value={awbNumber}
                  onChange={e => setAwbNumber(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            <button
              onClick={() => onUpdate(order.id, newStatus, trackingId, awbNumber)}
              disabled={updating || newStatus === order.status}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-all"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense fallback={<div className="skeleton h-96 rounded-2xl" />}><OrdersContent /></Suspense>;
}