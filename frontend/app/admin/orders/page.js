'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, Eye, Edit2,
  Package, Truck, MapPin, Phone, User, X, Copy, CheckCircle2,
  Tag
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
  OUT_FOR_DELIVERY: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  RETURNED: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  REFUNDED: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
};

const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];

function StatusBadge({ status }) {
  const c = statusColors[status] || statusColors.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const initStatus = searchParams.get('status') || '';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initStatus);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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
      setTotalPages(res.data.pagination?.totalPages || 1);
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
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const filtered = orders.filter(o =>
    !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.phone?.includes(search)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mx-[-1rem] px-[1rem] sm:mx-0 sm:px-0 overflow-x-auto pb-2 hide-scroll">
        {[
          { val: '', label: 'All', count: total },
          ...['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => ({
            val: s, label: s.replace(/_/g, ' '), count: null
          }))
        ].map(({ val, label, count }) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border-2 ${statusFilter === val
              ? 'bg-primary-900 text-white border-primary-900 shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
            {label}
            {count !== null && <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === val ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none focus:ring-4 focus:ring-primary-50 font-medium transition-all"
          placeholder="Search order#, customer name, phone..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="h-5 bg-gray-100 rounded animate-pulse w-1/3 mb-3" />
              <div className="h-4 bg-gray-50 rounded animate-pulse w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">No orders found</p>
          </div>
        ) : filtered.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
              {/* Order # */}
              <div className="min-w-[120px]">
                <p className="text-sm font-extrabold text-primary-900">#{order.orderNumber}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                  {order.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{order.user?.name}</p>
                  <p className="text-[11px] text-gray-500">{order.user?.phone}</p>
                </div>
              </div>

              {/* Items Count */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium min-w-[90px]">
                <Package className="w-4 h-4 text-gray-400" />
                <span>{order.items?.length || 0} items</span>
              </div>

              {/* Amount */}
              <div className="min-w-[100px] text-left md:text-right">
                <p className="text-sm font-extrabold text-gray-900">{RS}{fmt(order.totalAmount)}</p>
                <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                  {order.paymentMethod} · {order.paymentStatus}
                </p>
              </div>

              {/* Status */}
              <div className="min-w-[120px]">
                <StatusBadge status={order.status} />
              </div>

              {/* Actions */}
              <div className="ml-auto mt-2 md:mt-0 items-center justify-end w-full md:w-auto">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full md:w-auto px-4 py-2 rounded-xl bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-900 border border-gray-200 hover:border-primary-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-gray-500 font-semibold">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors">
              Previous
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 text-xs font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleStatusUpdate}
          updating={updatingId === selectedOrder.id}
        />
      )}

      <style>{`.hide-scroll::-webkit-scrollbar{display:none}.hide-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}

function OrderDetailsModal({ order, onClose, onUpdate, updating }) {
  const [status, setStatus] = useState(order.status);
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [awbNumber, setAwbNumber] = useState(order.awbNumber || '');
  const addr = order.shippingAddress;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-gray-900 flex items-center gap-3">
              Order #{order.orderNumber}
              <StatusBadge status={order.status} />
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer & Shipping */}
            <div className="space-y-4">
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary-900" />
                  <h3 className="font-bold text-gray-900">Customer Info</h3>
                </div>
                <p className="text-sm font-bold text-gray-900">{order.user?.name}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {order.user?.phone || '\u2014'}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {order.user?.email || '\u2014'}
                  </p>
                </div>
              </div>

              {addr && (
                <div className="bg-amber-50 border-2 border-amber-100/50 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-amber-700" />
                    <h3 className="font-bold text-amber-900">Shipping Address</h3>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                  <div className="mt-2 space-y-1 text-sm text-gray-700 font-medium">
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                  {addr.phone && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 px-3 py-1.5 bg-white rounded-lg border border-amber-200">
                        📞 {addr.phone}
                      </span>
                      <button onClick={() => copyToClipboard(addr.phone)} className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Change Status */}
            <div>
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm h-full">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-primary-900" />
                  Update Order
                </h3>

                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:border-primary-900 focus:ring-4 focus:ring-primary-50 transition-all outline-none mb-4"
                >
                  {allStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>

                {['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) && (
                  <div className="space-y-4 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">AWB Number</label>
                      <input
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none font-medium bg-white"
                        placeholder="e.g. 1234567890" value={awbNumber} onChange={e => setAwbNumber(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tracking ID</label>
                      <input
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none font-medium bg-white"
                        placeholder="Shipmozo order ID" value={trackingId} onChange={e => setTrackingId(e.target.value)} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onUpdate(order.id, status, trackingId, awbNumber)}
                  disabled={updating}
                  className="w-full bg-primary-900 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-primary-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm "
                >
                  {updating ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Ordered Products */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-900" />
              Items Ordered ({order.items?.length})
            </h3>

            <div className="space-y-3">
              {order.items?.map((item, idx) => {
                const img = item.productImage || item.product?.image || item.product?.images?.[0]?.image;
                return (
                  <div key={idx} className="flex items-center gap-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {img ? (
                      <img src={img} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-white border border-gray-200" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.productName}</p>
                      {item.variantInfo && <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{typeof item.variantInfo === 'string' ? item.variantInfo : JSON.stringify(item.variantInfo)}</p>}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-600 font-medium">
                        <span>Quantity: <strong className="text-gray-900">{item.quantity}</strong></span>
                        <span>Unit Price: <strong>{RS}{fmt(item.unitPrice)}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-primary-900">{RS}{fmt(item.totalPrice)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Payment & Summary</h3>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="text-sm font-bold text-gray-900">
                    {order.paymentMethod}
                    <span className={`ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
                {order.paymentId && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction ID</p>
                    <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block text-gray-700">{order.paymentId}</p>
                  </div>
                )}
                {order.couponCode && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Applied Coupon</p>
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                      <Tag className="w-3.5 h-3.5" />
                      {order.couponCode}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Subtotal</span>
                  <span>{RS}{fmt(order.subtotal || order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{order.shippingCharge > 0 ? `${RS}${fmt(order.shippingCharge)}` : 'Free'}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>Discount</span>
                    <span>-{RS}{fmt(order.discountAmount)}</span>
                  </div>
                )}
                {/* gstAmount? Not always separate, mostly included. Include if > 0 */}
                {Number(order.gstAmount) > 0 && (
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Estimated Tax (GST)</span>
                    <span>{RS}{fmt(order.gstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span className="text-primary-900 text-lg">{RS}{fmt(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense><OrdersContent /></Suspense>;
}