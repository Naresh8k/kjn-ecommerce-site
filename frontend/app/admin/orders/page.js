'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, Eye, Download,
  Package, Truck, MapPin, Phone, User, X, Copy,
  Tag, FileText, ChevronLeft, ChevronRight, ExternalLink, Zap,
  CreditCard, RefreshCw, RotateCcw, AlertCircle, CheckCircle,
  Clock, XCircle, IndianRupee, ShieldAlert, ArrowUpRight,
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

const paymentStatusConfig = {
  PAID:           { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500',  Icon: CheckCircle },
  PENDING:        { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500',  Icon: Clock       },
  FAILED:         { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500',    Icon: XCircle     },
  REFUNDED:       { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400', Icon: RotateCcw   },
  PARTIAL_REFUND: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500',   Icon: RotateCcw   },
};

const rzpMethodConfig = {
  upi:        { label: 'UPI',         color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  card:       { label: 'Card',        color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  netbanking: { label: 'Net Banking', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  wallet:     { label: 'Wallet',      color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200'   },
  emi:        { label: 'EMI',         color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200'   },
};

function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status?.replace('_', ' ')}
    </span>
  );
}

function PaymentStatusBadge({ status }) {
  const c = paymentStatusConfig[status] || paymentStatusConfig.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status?.replace('_', ' ')}
    </span>
  );
}

function CopyBtn({ text, className = '' }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); toast.success('Copied!'); }}
      className={`text-gray-300 hover:text-gray-500 transition-colors ${className}`}
    >
      <Copy className="w-3 h-3" />
    </button>
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
          onRefresh={() => { fetchOrders(); fetchCounts(); }}
        />
      )}
    </div>
  );
}

/* === Razorpay Payment Panel === */
function RazorpayPaymentPanel({ order, onRefreshOrder }) {
  const [rzpData,       setRzpData]       = useState(null);
  const [loadingRzp,    setLoadingRzp]    = useState(false);
  const [fetchedOnce,   setFetchedOnce]   = useState(false);
  const [refunds,       setRefunds]       = useState([]);
  const [loadingRef,    setLoadingRef]    = useState(false);
  const [showRefundDlg, setShowRefundDlg] = useState(false);
  const [refundType,    setRefundType]    = useState('full');
  const [refundAmt,     setRefundAmt]     = useState('');
  const [refundReason,  setRefundReason]  = useState('');
  const [submitting,    setSubmitting]    = useState(false);

  const isCOD       = order.paymentMethod === 'COD';
  const hasPayment  = !!order.paymentId;
  const maxRefund   = parseFloat(order.totalAmount);

  // Fetch live Razorpay payment details
  const fetchRzp = async () => {
    if (!hasPayment) return;
    setLoadingRzp(true);
    try {
      const r = await api.get(`/payments/details/${order.paymentId}`);
      setRzpData(r.data.data);
      setFetchedOnce(true);
    } catch { toast.error('Could not fetch Razorpay details'); }
    finally { setLoadingRzp(false); }
  };

  // Fetch refunds for this order
  const fetchRefunds = async () => {
    setLoadingRef(true);
    try {
      const r = await api.get(`/payments/refunds?limit=50`);
      const all = r.data.data || [];
      setRefunds(all.filter(rf => rf.orderId === order.id));
    } catch {}
    finally { setLoadingRef(false); }
  };

  // Auto-load if order has a payment ID
  useEffect(() => {
    if (hasPayment && !fetchedOnce) {
      fetchRzp();
      fetchRefunds();
    }
  }, [order.id]);

  const handleRefund = async (e) => {
    e.preventDefault();
    if (!refundReason.trim()) { toast.error('Reason is required'); return; }
    const amt = refundType === 'full' ? maxRefund : parseFloat(refundAmt);
    if (!amt || amt <= 0 || amt > maxRefund) { toast.error(`Amount must be between ₹1 and ₹${maxRefund}`); return; }
    setSubmitting(true);
    try {
      const payload = { orderId: order.id, reason: refundReason.trim() };
      if (refundType === 'partial') payload.amount = amt;
      await api.post('/payments/refund', payload);
      toast.success(`Refund of ₹${amt} initiated!`);
      setShowRefundDlg(false);
      setRefundReason('');
      setRefundAmt('');
      fetchRefunds();
      if (onRefreshOrder) onRefreshOrder();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to initiate refund'); }
    finally { setSubmitting(false); }
  };

  const RS = String.fromCharCode(8377);
  const fmt = n => Number(n || 0).toLocaleString('en-IN');

  // COD orders — minimal panel
  if (isCOD) {
    return (
      <div className="border-2 border-gray-200 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <IndianRupee className="w-3.5 h-3.5 text-gray-500" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment — Cash on Delivery</h3>
        </div>
        <p className="text-xs text-gray-400">COD orders are not processed through Razorpay. No online payment data available.</p>
        <div className="mt-3 flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200 text-xs">
          <span className="text-gray-500">Collection Status</span>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>
    );
  }

  // Online order without paymentId yet
  if (!hasPayment) {
    return (
      <div className="border-2 border-amber-200 bg-amber-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">Payment — Awaiting</h3>
        </div>
        <p className="text-xs text-amber-600">Customer has not completed payment yet. The Razorpay order was created but no payment captured.</p>
        {order.razorpayOrderId && (
          <div className="mt-3 flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-200 text-xs">
            <span className="text-gray-500">Razorpay Order ID</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-gray-700">{order.razorpayOrderId}</span>
              <CopyBtn text={order.razorpayOrderId} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full Razorpay panel for captured payments
  const pCfg = rzpData ? (rzpMethodConfig[rzpData.method] || {}) : {};

  return (
    <div className="border-2 border-blue-200 bg-blue-50/30 rounded-xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5 text-blue-700" />
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">Razorpay Payment</h3>
        </div>
        <div className="flex items-center gap-2">
          <PaymentStatusBadge status={order.paymentStatus} />
          <button
            onClick={fetchRzp}
            disabled={loadingRzp}
            className="w-7 h-7 rounded-lg bg-white border border-blue-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
            title="Refresh from Razorpay"
          >
            <RefreshCw className={`w-3 h-3 text-blue-600 ${loadingRzp ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Amount hero */}
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100">
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{RS}{fmt(order.totalAmount)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {rzpData ? `${rzpData.currency || 'INR'} · ${new Date(rzpData.created_at * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}` : 'Online Payment'}
            </p>
          </div>
          {rzpData?.method && (
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1.5 rounded-xl border ${pCfg.bg || 'bg-gray-50'} ${pCfg.color || 'text-gray-600'} ${pCfg.border || 'border-gray-200'}`}>
              {pCfg.label || rzpData.method}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {loadingRzp && !rzpData && (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-6 bg-blue-100/60 rounded-lg animate-pulse" />)}
          </div>
        )}

        {/* Live Razorpay data */}
        {rzpData && (
          <>
            {/* Method details */}
            <div className="bg-white rounded-xl p-3 border border-blue-100 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Method Details</p>
              {[
                { label: 'Method',        value: rzpData.method?.toUpperCase() },
                { label: 'Bank',          value: rzpData.bank },
                { label: 'Card Network',  value: rzpData.card?.network },
                { label: 'Card Type',     value: rzpData.card?.type },
                { label: 'Card Issuer',   value: rzpData.card?.issuer },
                { label: 'Last 4 Digits', value: rzpData.card?.last4 ? `•••• ${rzpData.card.last4}` : null },
                { label: 'Wallet',        value: rzpData.wallet },
                { label: 'UPI / VPA',     value: rzpData.vpa },
                { label: 'EMI Months',    value: rzpData.emi ? `${rzpData.emi_duration} months @ ${rzpData.emi_plan?.rate || ''}%` : null },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-700">{value}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            {(rzpData.email || rzpData.contact) && (
              <div className="bg-white rounded-xl p-3 border border-blue-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Contact (Razorpay)</p>
                {rzpData.email   && <div className="flex justify-between text-xs"><span className="text-gray-400">Email</span><span className="font-semibold text-gray-700">{rzpData.email}</span></div>}
                {rzpData.contact && <div className="flex justify-between text-xs"><span className="text-gray-400">Phone</span><span className="font-semibold text-gray-700">{rzpData.contact}</span></div>}
              </div>
            )}

            {/* Reference IDs */}
            <div className="bg-white rounded-xl p-3 border border-blue-100 space-y-2.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reference IDs</p>
              {[
                { label: 'Payment ID',       value: rzpData.id || order.paymentId },
                { label: 'Razorpay Order ID', value: rzpData.order_id || order.razorpayOrderId },
                { label: 'Invoice ID',        value: rzpData.invoice_id },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-mono text-gray-600 truncate">{value}</span>
                    <CopyBtn text={value} />
                  </div>
                </div>
              ))}
              <a
                href={`https://dashboard.razorpay.com/app/payments/${rzpData.id || order.paymentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> View in Razorpay Dashboard
              </a>
            </div>
          </>
        )}

        {/* Refunds list */}
        {refunds.length > 0 && (
          <div className="bg-white rounded-xl p-3 border border-purple-100 space-y-2">
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3" /> Refunds ({refunds.length})
            </p>
            {refunds.map(rf => (
              <div key={rf.id} className="flex items-center justify-between text-xs py-1.5 border-t border-gray-50 first:border-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-gray-700">{RS}{fmt(rf.amount)}</span>
                  <span className="text-gray-400 text-[10px]">{rf.reason?.slice(0, 40) || '—'}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    rf.status === 'PROCESSED' ? 'bg-green-50 text-green-700 border-green-200'
                    : rf.status === 'FAILED'  ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>{rf.status}</span>
                  {rf.razorpayRefundId && (
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] text-gray-400">{rf.razorpayRefundId.slice(0, 14)}...</span>
                      <CopyBtn text={rf.razorpayRefundId} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Refund button — only for captured online payments not fully refunded */}
          {!isCOD && hasPayment && !['REFUNDED'].includes(order.paymentStatus) && (
            <button
              onClick={() => setShowRefundDlg(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                showRefundDlg
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {showRefundDlg ? 'Cancel' : 'Initiate Refund'}
            </button>
          )}
          {hasPayment && (
            <a
              href={`https://dashboard.razorpay.com/app/payments/${order.paymentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-white text-blue-700 border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Razorpay
            </a>
          )}
        </div>

        {/* Inline Refund Form */}
        {showRefundDlg && (
          <form onSubmit={handleRefund} className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Initiate Refund
            </p>

            {/* Full / Partial toggle */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'full',    label: 'Full Refund',    sub: `${RS}${fmt(maxRefund)}` },
                { id: 'partial', label: 'Partial Refund', sub: 'Enter amount' },
              ].map(opt => (
                <button key={opt.id} type="button"
                  onClick={() => { setRefundType(opt.id); if (opt.id === 'full') setRefundAmt(String(maxRefund)); }}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${refundType === opt.id ? 'border-red-600 bg-white' : 'border-red-200 bg-white/60 hover:border-red-300'}`}>
                  <p className={`text-xs font-bold ${refundType === opt.id ? 'text-red-700' : 'text-gray-600'}`}>{opt.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>

            {/* Partial amount */}
            {refundType === 'partial' && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{RS}</span>
                <input
                  type="number" step="0.01" min="1" max={maxRefund}
                  placeholder="0.00" value={refundAmt} onChange={e => setRefundAmt(e.target.value)} required
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-red-200 text-sm outline-none focus:ring-2 focus:ring-red-400 bg-white"
                />
              </div>
            )}

            {/* Reason */}
            <textarea rows={2} required placeholder="Reason for refund (e.g. customer requested cancellation)..."
              value={refundReason} onChange={e => setRefundReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-red-200 text-xs outline-none focus:ring-2 focus:ring-red-400 bg-white resize-none"
            />

            {/* Warning */}
            <div className="text-[10px] text-red-600 bg-red-100 rounded-lg px-3 py-2 space-y-0.5">
              <p className="font-bold">⚠ This action is irreversible once submitted to Razorpay.</p>
              <p>Customer will be notified via email. Reflects in bank in 5–7 business days.</p>
            </div>

            <button type="submit" disabled={submitting || !refundReason.trim()}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors">
              {submitting
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                : <><RotateCcw className="w-3.5 h-3.5" /> Confirm Refund of {RS}{fmt(refundType === 'full' ? maxRefund : (refundAmt || 0))}</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* === Order Detail Modal === */
function OrderDetailsModal({ order, onClose, onUpdate, onDownload, updating, onRefresh }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [awbNumber, setAwbNumber] = useState(order.awbNumber || '');

  // ShipMozo state
  const [smWeight, setSmWeight] = useState('');
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [cancellingShipment, setCancellingShipment] = useState(false);
  const [smTracking, setSmTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

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

  const handleCreateShipment = async () => {
    setCreatingShipment(true);
    try {
      const body = {};
      if (smWeight) body.weightGrams = parseInt(smWeight);
      const r = await api.post(`/shipmozo/orders/${order.id}/create-shipment`, body);
      toast.success('Shipment created on ShipMozo!');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleCancelShipment = async () => {
    if (!confirm('Cancel this shipment on ShipMozo?')) return;
    setCancellingShipment(true);
    try {
      await api.post(`/shipmozo/orders/${order.id}/cancel-shipment`);
      toast.success('Shipment cancellation requested');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancellingShipment(false);
    }
  };

  const handleFetchTracking = async () => {
    setTrackingLoading(true);
    try {
      const r = await api.get(`/shipmozo/orders/${order.id}/track`);
      setSmTracking(r.data.data);
    } catch {
      toast.error('Could not fetch tracking info');
    } finally {
      setTrackingLoading(false);
    }
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
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
            <span className="text-xs text-gray-500 font-bold border border-gray-200 bg-gray-50 px-2.5 py-1 rounded-full">
              {order.paymentMethod === 'COD' ? '💵 COD' : `💳 ${order.paymentMethod || 'Online'}`}
            </span>
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
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
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

          {/* ======= Razorpay Payment Panel ======= */}
          <RazorpayPaymentPanel order={order} onRefreshOrder={onRefresh} />

          {/* ======= ShipMozo Panel ======= */}
          <div className="border-2 border-orange-200 bg-orange-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> ShipMozo Shipping
              </h3>
              <a href="https://app.shipmozo.com" target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                Open ShipMozo <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Existing shipment info */}
            {order.shipmozoShipmentId ? (
              <div className="bg-white rounded-lg p-3 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">ShipMozo ID</span>
                  <span className="text-xs font-extrabold text-orange-700 font-mono">{order.shipmozoShipmentId}</span>
                </div>
                {order.awbNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">AWB Number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-gray-800 font-mono">{order.awbNumber}</span>
                      <button onClick={() => copyToClipboard(order.awbNumber)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                {order.shipmozoCourier && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Courier</span>
                    <span className="text-xs font-semibold text-gray-700">{order.shipmozoCourier}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleFetchTracking}
                    disabled={trackingLoading}
                    className="flex-1 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {trackingLoading
                      ? <><div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" /> Loading...</>
                      : <><Zap className="w-3 h-3" /> Live Track</>}
                  </button>
                  <button
                    onClick={handleCancelShipment}
                    disabled={cancellingShipment}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {cancellingShipment ? 'Cancelling...' : 'Cancel'}
                  </button>
                </div>
                {/* Live tracking events */}
                {smTracking && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Live Tracking</p>
                    {(smTracking?.tracking?.data?.scans || smTracking?.data?.scans || smTracking?.scans || []).length > 0 ? (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {(smTracking?.tracking?.data?.scans || smTracking?.data?.scans || smTracking?.scans || []).map((scan, i) => (
                          <div key={i} className="flex gap-2 text-xs">
                            <span className="text-gray-400 whitespace-nowrap flex-shrink-0">{scan.date || scan.scan_date || ''}</span>
                            <span className="text-gray-700 font-medium">{scan.location || scan.city || ''}</span>
                            <span className="text-gray-500">{scan.status || scan.activity || scan.remark || ''}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No tracking events yet</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Create shipment form */
              <div className="space-y-3">
                <p className="text-xs text-orange-700">No shipment created yet. Book it on ShipMozo:</p>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">
                    Total Weight (grams) <span className="text-gray-400 normal-case font-normal">- leave empty to auto-calculate</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={smWeight}
                    onChange={e => setSmWeight(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-sm outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="bg-white rounded-lg p-3 border border-orange-200 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between"><span className="text-gray-400">Payment</span><span className="font-bold">{order.paymentMethod === 'COD' ? 'COD' : 'Prepaid'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Amount</span><span className="font-bold">{RS}{fmt(order.totalAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Pincode</span><span className="font-bold">{order.shippingAddress?.pincode}</span></div>
                </div>
                <button
                  onClick={handleCreateShipment}
                  disabled={creatingShipment}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {creatingShipment
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                    : <><Truck className="w-4 h-4" /> Create Shipment on ShipMozo</>}
                </button>
              </div>
            )}
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