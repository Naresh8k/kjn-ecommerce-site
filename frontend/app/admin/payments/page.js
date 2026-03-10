'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard, RotateCcw, BarChart3, Landmark, ShieldAlert,
  Search, RefreshCw, X, ExternalLink, Copy, AlertCircle,
  CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  User, FileText, Info, IndianRupee, Zap, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ?????????????????????????????????????????????????????????????????????????????
// CONSTANTS & HELPERS
// ?????????????????????????????????????????????????????????????????????????????
const RS = String.fromCharCode(8377);
const fmt  = n  => Number(n || 0).toLocaleString('en-IN');
const fmtD = d  => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const fmtDShort = d => new Date(d * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

const TABS = [
  { id: 'overview',    label: 'Overview',    Icon: BarChart3   },
  { id: 'payments',    label: 'Payments',    Icon: CreditCard  },
  { id: 'refunds',     label: 'Refunds',     Icon: RotateCcw   },
  { id: 'settlements', label: 'Settlements', Icon: Landmark    },
  { id: 'disputes',    label: 'Disputes',    Icon: ShieldAlert },
];

// ?????????????????????????????????????????????????????????????????????????????
// SHARED BADGE COMPONENTS
// ?????????????????????????????????????????????????????????????????????????????
const paymentStatusCfg = {
  captured:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  authorized:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  failed:      { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  refunded:    { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
  created:     { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
};
const refundStatusCfg = {
  PENDING:   { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500',  Icon: Clock       },
  PROCESSED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500',  Icon: CheckCircle },
  FAILED:    { bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200',   dot: 'bg-red-500',    Icon: XCircle     },
};
const orderStatusCfg = {
  PENDING:          { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  CONFIRMED:        { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  PROCESSING:       { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  SHIPPED:          { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
  OUT_FOR_DELIVERY: { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200'    },
  DELIVERED:        { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CANCELLED:        { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
  RETURNED:         { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200'    },
  REFUNDED:         { bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200'    },
};
const disputeStatusCfg = {
  open:         { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  under_review: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200'  },
  won:          { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  lost:         { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200'   },
  closed:       { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200'   },
};

function PayBadge({ status }) {
  const c = paymentStatusCfg[status] || paymentStatusCfg.created;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}
function RefBadge({ status }) {
  const c = refundStatusCfg[status] || refundStatusCfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {status}
    </span>
  );
}
function OrdBadge({ status }) {
  const c = orderStatusCfg[status] || orderStatusCfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
function DispBadge({ status }) {
  const c = disputeStatusCfg[status] || disputeStatusCfg.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// STAT CARD
// ?????????????????????????????????????????????????????????????????????????????
function StatCard({ label, value, sub, Icon, color, trend }) {
  const colors = {
    green:  { bg: 'bg-green-50',  icon: 'bg-green-100',  iconText: 'text-green-600',  val: 'text-green-800'  },
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100',   iconText: 'text-blue-600',   val: 'text-blue-800'   },
    amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100',  iconText: 'text-amber-600',  val: 'text-amber-800'  },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100',    iconText: 'text-red-600',    val: 'text-red-800'    },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100', iconText: 'text-purple-600', val: 'text-purple-800' },
    gray:   { bg: 'bg-gray-50',   icon: 'bg-gray-100',   iconText: 'text-gray-500',   val: 'text-gray-700'   },
  };
  const c = colors[color] || colors.gray;
  return (
    <div className={`${c.bg} rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${c.iconText}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className={`font-heading font-extrabold text-2xl ${c.val}`}>{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// COPY BUTTON
// ?????????????????????????????????????????????????????????????????????????????
function CopyBtn({ text }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); toast.success('Copied!'); }}
      className="text-gray-300 hover:text-gray-500 transition-colors"
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// PAYMENT DETAIL DRAWER
// ?????????????????????????????????????????????????????????????????????????????
function PaymentDrawer({ payment, onClose, onRefund }) {
  const amtRs = (payment.amount || 0) / 100;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">Payment Details</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{payment.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Amount + Status */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${paymentStatusCfg[payment.status]?.bg || 'bg-gray-50'} ${paymentStatusCfg[payment.status]?.border || 'border-gray-200'}`}>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{RS}{fmt(amtRs)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{payment.currency} · {fmtDShort(payment.created_at)}</p>
            </div>
            <PayBadge status={payment.status} />
          </div>

          {/* Payment method */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</p>
            {[
              { label: 'Method',      value: payment.method },
              { label: 'Bank',        value: payment.bank },
              { label: 'Card Network', value: payment.card?.network },
              { label: 'Card Type',   value: payment.card?.type },
              { label: 'Card Issuer', value: payment.card?.issuer },
              { label: 'Last 4',      value: payment.card?.last4 ? `•••• ${payment.card.last4}` : null },
              { label: 'Wallet',      value: payment.wallet },
              { label: 'VPA',         value: payment.vpa },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-gray-700">{value}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          {(payment.email || payment.contact) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Customer Contact
              </p>
              {payment.email   && <div className="flex justify-between text-xs"><span className="text-gray-400">Email</span><span className="font-semibold text-gray-700">{payment.email}</span></div>}
              {payment.contact && <div className="flex justify-between text-xs"><span className="text-gray-400">Phone</span><span className="font-semibold text-gray-700">{payment.contact}</span></div>}
            </div>
          )}

          {/* Local Order */}
          {payment.localOrder && (
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-200 space-y-2">
              <p className="text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Linked KJN Order</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-900">#{payment.localOrder.orderNumber}</span>
                <OrdBadge status={payment.localOrder.status} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">Customer</span>
                <span className="font-semibold text-primary-800">{payment.localOrder.user?.name}</span>
              </div>
            </div>
          )}

          {/* IDs */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">References</p>
            {[
              { label: 'Payment ID',     value: payment.id },
              { label: 'Order ID',       value: payment.order_id },
              { label: 'Invoice ID',     value: payment.invoice_id },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-mono text-gray-600 truncate">{value}</span>
                  <CopyBtn text={value} />
                </div>
              </div>
            ))}
            <a href={`https://dashboard.razorpay.com/app/payments/${payment.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 mt-1">
              <ExternalLink className="w-3 h-3" /> View in Razorpay Dashboard
            </a>
          </div>

          {/* Refund button — only captured payments */}
          {payment.status === 'captured' && (
            <button
              onClick={() => onRefund(payment)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Initiate Refund for this Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// REFUND DETAIL DRAWER
// ?????????????????????????????????????????????????????????????????????????????
function RefundDrawer({ refund, onClose }) {
  const [livePayment, setLivePayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const copy = t => { navigator.clipboard.writeText(t); toast.success('Copied!'); };
  const c = refundStatusCfg[refund.status] || refundStatusCfg.PENDING;

  useEffect(() => {
    if (!refund.razorpayPaymentId) return;
    setLoading(true);
    api.get(`/payments/details/${refund.razorpayPaymentId}`)
      .then(r => setLivePayment(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refund.razorpayPaymentId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">Refund Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Order #{refund.order?.orderNumber}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${c.bg} ${c.border}`}>
            <c.Icon className={`w-5 h-5 ${c.text}`} />
            <div className="flex-1">
              <p className={`text-sm font-bold ${c.text}`}>Refund {refund.status}</p>
              <p className={`text-xs ${c.text} opacity-80`}>{fmtD(refund.createdAt)}</p>
            </div>
            <p className={`font-extrabold text-xl ${c.text}`}>{RS}{fmt(refund.amount)}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Customer</p>
            <p className="text-sm font-bold text-gray-900">{refund.order?.user?.name}</p>
            <p className="text-xs text-gray-500">{refund.order?.user?.email}</p>
            {refund.order?.user?.phone && <p className="text-xs text-gray-500">{refund.order.user.phone}</p>}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> References</p>
            {[
              { label: 'Razorpay Refund ID',  value: refund.razorpayRefundId },
              { label: 'Razorpay Payment ID', value: refund.razorpayPaymentId },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-gray-700 truncate max-w-[180px]">{value}</span>
                  <CopyBtn text={value} />
                </div>
              </div>
            ))}
            {refund.razorpayRefundId && (
              <a href={`https://dashboard.razorpay.com/app/refunds/${refund.razorpayRefundId}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 mt-1">
                <ExternalLink className="w-3 h-3" /> View in Razorpay Dashboard
              </a>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Reason</p>
            <p className="text-sm text-gray-700">{refund.reason || '—'}</p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Initiated by <span className="font-semibold text-gray-600">{refund.initiatedBy?.name || 'Admin'}</span></span>
            <span>{fmtD(refund.createdAt)}</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching live data...</div>
          ) : livePayment ? (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Live from Razorpay</p>
              {[
                { label: 'Status',  value: livePayment.status },
                { label: 'Method',  value: livePayment.method },
                { label: 'Bank',    value: livePayment.bank },
                { label: 'VPA',     value: livePayment.vpa },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-blue-500">{label}</span>
                  <span className="font-semibold text-blue-800">{value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// INITIATE REFUND MODAL
// ?????????????????????????????????????????????????????????????????????????????
function InitiateRefundModal({ prefillPayment = null, onClose, onSuccess }) {
  const [orderSearch, setOrderSearch] = useState(prefillPayment?.localOrder?.orderNumber || '');
  const [foundOrder,  setFoundOrder]  = useState(prefillPayment?.localOrder || null);
  const [searching,   setSearching]   = useState(false);
  const [refundType,  setRefundType]  = useState('full');
  const [amount,      setAmount]      = useState(prefillPayment ? String((prefillPayment.amount || 0) / 100) : '');
  const [reason,      setReason]      = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const searchOrder = async () => {
    if (!orderSearch.trim()) return;
    setSearching(true); setFoundOrder(null);
    try {
      const r = await api.get(`/orders/admin/all?search=${encodeURIComponent(orderSearch.trim())}&limit=1`);
      const orders = r.data.data || [];
      if (!orders.length) { toast.error('No order found'); return; }
      const o = orders[0];
      if ((o.paymentMethod === 'COD' || !o.paymentId) && !prefillPayment) {
        toast.error('COD orders cannot be refunded online'); return;
      }
      if (o.paymentStatus === 'REFUNDED') { toast.error('Already fully refunded'); return; }
      setFoundOrder(o);
      setAmount(String(parseFloat(o.totalAmount)));
    } catch { toast.error('Failed to search order'); }
    finally { setSearching(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foundOrder && !prefillPayment) return;
    if (!reason.trim()) { toast.error('Reason is required'); return; }
    const maxAmt = foundOrder ? parseFloat(foundOrder.totalAmount) : (prefillPayment ? prefillPayment.amount / 100 : 0);
    const finalAmount = refundType === 'full' ? maxAmt : parseFloat(amount);
    if (!finalAmount || finalAmount <= 0) { toast.error('Enter a valid amount'); return; }
    if (finalAmount > maxAmt) { toast.error(`Cannot exceed ${RS}${fmt(maxAmt)}`); return; }
    setSubmitting(true);
    try {
      const payload = { reason: reason.trim() };
      if (foundOrder) payload.orderId = foundOrder.id;
      if (refundType === 'partial') payload.amount = finalAmount;
      await api.post('/payments/refund', payload);
      toast.success(`Refund of ${RS}${fmt(finalAmount)} initiated!`);
      onSuccess(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to initiate refund'); }
    finally { setSubmitting(false); }
  };

  const maxAmt = foundOrder ? parseFloat(foundOrder.totalAmount) : (prefillPayment ? prefillPayment.amount / 100 : 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">Initiate Refund</h2>
            <p className="text-xs text-gray-400 mt-0.5">Process via Razorpay</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pre-filled from payment drawer */}
          {prefillPayment && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-xs">
              <p className="font-bold text-blue-700 mb-1">Refunding payment</p>
              <p className="font-mono text-blue-600">{prefillPayment.id}</p>
              <p className="text-blue-500 mt-0.5">{RS}{fmt(prefillPayment.amount / 100)} · {prefillPayment.method}</p>
            </div>
          )}

          {/* Order search */}
          {!prefillPayment && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Order Number</label>
              <div className="flex gap-2">
                <input type="text" placeholder="e.g. KJN123456" value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchOrder())}
                  className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:border-primary-500 focus:outline-none" />
                <button type="button" onClick={searchOrder} disabled={searching || !orderSearch.trim()}
                  className="px-4 py-2.5 bg-primary-900 text-white rounded-xl text-sm font-bold hover:bg-primary-800 disabled:opacity-50 transition-colors">
                  {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Found order card */}
          {foundOrder && (
            <div className="bg-gray-50 rounded-xl border-2 border-primary-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm font-bold text-gray-900">#{foundOrder.orderNumber}</span></div>
                <OrdBadge status={foundOrder.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                  <p className="text-gray-400 mb-0.5">Customer</p>
                  <p className="font-semibold text-gray-800">{foundOrder.user?.name}</p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                  <p className="text-gray-400 mb-0.5">Amount Paid</p>
                  <p className="font-extrabold text-base text-gray-900">{RS}{fmt(foundOrder.totalAmount)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Refund type — show when we have an order or prefill */}
          {(foundOrder || prefillPayment) && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Refund Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'full',    label: 'Full Refund',    sub: `${RS}${fmt(maxAmt)}` },
                    { id: 'partial', label: 'Partial Refund', sub: 'Enter custom amount' },
                  ].map(opt => (
                    <button key={opt.id} type="button"
                      onClick={() => { setRefundType(opt.id); if (opt.id === 'full') setAmount(String(maxAmt)); }}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${refundType === opt.id ? 'border-primary-900 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <p className={`text-sm font-bold ${refundType === opt.id ? 'text-primary-900' : 'text-gray-700'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {refundType === 'partial' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Amount (max {RS}{fmt(maxAmt)})</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{RS}</span>
                    <input type="number" step="0.01" min="1" max={maxAmt} placeholder="0.00" value={amount}
                      onChange={e => setAmount(e.target.value)} required
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:border-primary-500 focus:outline-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reason <span className="text-red-400">*</span></label>
                <textarea rows={3} placeholder="e.g. Customer requested cancellation, damaged item, out of stock..."
                  value={reason} onChange={e => setReason(e.target.value)} required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:border-primary-500 focus:outline-none resize-none" />
              </div>

              <div className="flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
                  <li>Reflects in customer bank in 5–7 business days</li>
                  <li>Irreversible once submitted to Razorpay</li>
                  <li>Customer notified via email & in-app</li>
                </ul>
              </div>

              <button type="submit" disabled={submitting || !reason.trim()}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                {submitting
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                  : <><RotateCcw className="w-4 h-4" /> Initiate {refundType === 'full' ? 'Full' : 'Partial'} Refund of {RS}{fmt(refundType === 'full' ? maxAmt : (amount || 0))}</>}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// TAB: OVERVIEW
// ?????????????????????????????????????????????????????????????????????????????
function OverviewTab({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/summary').then(r => setData(r.data.data)).catch(() => toast.error('Failed to load summary')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>;
  if (!data) return null;

  const paymentMix = data.onlineOrders + data.codOrders > 0
    ? Math.round((data.onlineOrders / (data.onlineOrders + data.codOrders)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Collected"    value={`${RS}${fmt(data.totalCollected)}`}   sub={`${data.totalOrders} paid orders`}      Icon={IndianRupee} color="green"  />
        <StatCard label="Online Payments"    value={`${RS}${fmt(data.onlineCollected)}`}  sub={`${data.onlineOrders} orders`}           Icon={CreditCard}  color="blue"   />
        <StatCard label="COD Collected"      value={`${RS}${fmt(data.codCollected)}`}     sub={`${data.codOrders} orders`}              Icon={Zap}         color="amber"  />
        <StatCard label="Total Refunded"     value={`${RS}${fmt(data.totalRefunded)}`}    sub={`${data.refundedOrders} orders`}         Icon={RotateCcw}   color="red"    />
        <StatCard label="Failed Payments"    value={data.failedPayments}                  sub="Not charged"                             Icon={XCircle}     color="gray"   />
        <StatCard label="Pending Refunds"    value={data.pendingRefunds}                  sub="Awaiting Razorpay"                       Icon={Clock}       color="amber"  />
      </div>

      {/* Payment Mix Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-base text-gray-900">Payment Mix</h3>
          <span className="text-xs text-gray-400">{data.onlineOrders + data.codOrders} total orders</span>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Online (UPI / Card / NetBanking)', pct: paymentMix,       orders: data.onlineOrders, amt: data.onlineCollected, color: 'bg-blue-500'  },
            { label: 'Cash on Delivery',                 pct: 100 - paymentMix, orders: data.codOrders,    amt: data.codCollected,    color: 'bg-amber-400' },
          ].map(row => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-700">{row.label}</span>
                <span className="text-gray-500">{row.pct}% · {RS}{fmt(row.amt)} · {row.orders} orders</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-heading font-bold text-base text-gray-900">Recent Online Payments</h3>
          <button onClick={() => onNavigate('payments')} className="text-xs font-bold text-primary-700 hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentPayments.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">No payments yet</p>
          ) : data.recentPayments.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-blue-700">{p.user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.user?.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">#{p.orderNumber}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-extrabold text-gray-900">{RS}{fmt(p.totalAmount)}</p>
                <p className="text-[10px] text-gray-400">{new Date(p.updatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links to Razorpay */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-5 text-white">
        <p className="font-heading font-bold text-base mb-3">Razorpay Dashboard</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Payments',    url: 'https://dashboard.razorpay.com/app/payments'    },
            { label: 'Refunds',     url: 'https://dashboard.razorpay.com/app/refunds'     },
            { label: 'Settlements', url: 'https://dashboard.razorpay.com/app/settlements' },
            { label: 'Disputes',    url: 'https://dashboard.razorpay.com/app/disputes'    },
          ].map(l => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors">
              {l.label} <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// TAB: PAYMENTS (from Razorpay API)
// ?????????????????????????????????????????????????????????????????????????????
function PaymentsTab({ onRefund }) {
  const [payments, setPayments]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');
  const [method,   setMethod]     = useState('');
  const [status,   setStatus]     = useState('');
  const [skip,     setSkip]       = useState(0);
  const [total,    setTotal]      = useState(0);
  const [selected, setSelected]   = useState(null);
  const COUNT = 25;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ count: COUNT, skip });
      const r = await api.get(`/payments/list?${params}`);
      setPayments(r.data.data || []);
      setTotal(r.data.count || 0);
    } catch { toast.error('Failed to fetch payments from Razorpay'); }
    finally { setLoading(false); }
  }, [skip]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = payments.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !search || p.id?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s) || p.contact?.includes(s) || p.localOrder?.orderNumber?.toLowerCase().includes(s);
    const matchMethod = !method || p.method === method;
    const matchStatus = !status || p.status === status;
    return matchSearch && matchMethod && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by payment ID, email, order #..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
        </div>
        <select value={method} onChange={e => setMethod(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Methods</option>
          {['upi','card','netbanking','wallet','emi'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Statuses</option>
          {['captured','authorized','failed','refunded','created'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={fetch} className="w-9 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Payment ID','Contact','Method','Amount','Status','Order','Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({length:8}).map((_,i)=>(
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-7 bg-gray-100 rounded animate-pulse"/></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No payments found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} onClick={() => setSelected(p)} className="hover:bg-gray-50/50 cursor-pointer group transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-gray-600">{p.id?.slice(0,16)}...</span>
                      <CopyBtn text={p.id} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-xs font-semibold text-gray-700">{p.email?.split('@')[0] || p.contact || '—'}</p>
                    <p className="text-[10px] text-gray-400">{p.contact || ''}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold text-gray-700 uppercase">{p.method || '—'}</span>
                    {p.bank && <p className="text-[10px] text-gray-400">{p.bank}</p>}
                    {p.vpa  && <p className="text-[10px] text-gray-400">{p.vpa}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-extrabold text-gray-900">{RS}{fmt((p.amount||0)/100)}</span>
                  </td>
                  <td className="px-5 py-3.5"><PayBadge status={p.status} /></td>
                  <td className="px-5 py-3.5">
                    {p.localOrder
                      ? <div><p className="text-xs font-bold text-primary-700">#{p.localOrder.orderNumber}</p><OrdBadge status={p.localOrder.status}/></div>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500">{fmtDShort(p.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">Showing {skip + 1}–{Math.min(skip + COUNT, skip + filtered.length)} of {total} payments</p>
          <div className="flex gap-1.5">
            <button onClick={() => setSkip(s => Math.max(0, s - COUNT))} disabled={skip === 0}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={() => setSkip(s => s + COUNT)} disabled={filtered.length < COUNT}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {selected && <PaymentDrawer payment={selected} onClose={() => setSelected(null)} onRefund={p => { setSelected(null); onRefund(p); }} />}
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// TAB: REFUNDS (our DB)
// ?????????????????????????????????????????????????????????????????????????????
function RefundsTab({ onInitiate }) {
  const [refunds,    setRefunds]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [statusF,    setStatusF]    = useState('');
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selected,   setSelected]   = useState(null);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusF) params.set('status', statusF);
      const r = await api.get(`/payments/refunds?${params}`);
      setRefunds(r.data.data || []);
      setPagination(r.data.pagination || { total: 0, totalPages: 1 });
    } catch { toast.error('Failed to load refunds'); }
    finally { setLoading(false); }
  }, [page, statusF]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const stats = {
    pending:   refunds.filter(r => r.status === 'PENDING').length,
    processed: refunds.filter(r => r.status === 'PROCESSED').length,
    failed:    refunds.filter(r => r.status === 'FAILED').length,
    total:     refunds.reduce((s, r) => s + parseFloat(r.amount || 0), 0),
  };

  const filtered = refunds.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.order?.orderNumber?.toLowerCase().includes(s) || r.order?.user?.name?.toLowerCase().includes(s) || r.razorpayRefundId?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="This Page Total" value={`${RS}${fmt(stats.total)}`} Icon={IndianRupee} color="purple" />
        <StatCard label="Pending"          value={stats.pending}              Icon={Clock}       color="amber"  />
        <StatCard label="Processed"        value={stats.processed}            Icon={CheckCircle} color="green"  />
        <StatCard label="Failed"           value={stats.failed}               Icon={XCircle}     color="red"    />
      </div>

      {/* Filters + action */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by order #, customer, refund ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div className="flex gap-1.5">
          {[{l:'All',v:''},{l:'Pending',v:'PENDING'},{l:'Processed',v:'PROCESSED'},{l:'Failed',v:'FAILED'}].map(t=>(
            <button key={t.v} onClick={()=>{setStatusF(t.v);setPage(1);}}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${statusF===t.v ? (t.v?`${refundStatusCfg[t.v]?.bg} ${refundStatusCfg[t.v]?.text} ${refundStatusCfg[t.v]?.border}`:'bg-gray-900 text-white border-gray-900') : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {t.l}
            </button>
          ))}
        </div>
        <button onClick={fetchRefunds} className="w-9 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={onInitiate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-900 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors">
          <RotateCcw className="w-4 h-4" /> New Refund
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order','Customer','Amount','Razorpay Refund ID','Status','By','Date'].map(h=>(
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({length:5}).map((_,i)=>(
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-7 bg-gray-100 rounded animate-pulse"/></td></tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center"><RotateCcw className="w-7 h-7 text-gray-300"/></div>
                    <p className="text-sm text-gray-400">No refunds found</p>
                    {!statusF && <button onClick={onInitiate} className="text-xs text-primary-700 font-bold hover:underline">Create first refund</button>}
                  </div>
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} onClick={()=>setSelected(r)} className="hover:bg-gray-50/50 cursor-pointer group transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-primary-700 font-mono">#{r.order?.orderNumber}</p>
                    <OrdBadge status={r.order?.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-primary-700">{r.order?.user?.name?.charAt(0)?.toUpperCase()||'?'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.order?.user?.name}</p>
                        <p className="text-[10px] text-gray-400">{r.order?.user?.phone||r.order?.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-sm font-extrabold text-gray-900">{RS}{fmt(r.amount)}</span></td>
                  <td className="px-5 py-3.5">
                    {r.razorpayRefundId ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-gray-600">{r.razorpayRefundId.slice(0,18)}...</span>
                        <span className="opacity-0 group-hover:opacity-100"><CopyBtn text={r.razorpayRefundId}/></span>
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5"><RefBadge status={r.status}/></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-gray-500">{r.initiatedBy?.name||'Admin'}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'})}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {pagination.totalPages} · {pagination.total} refunds</p>
            <div className="flex gap-1.5">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
              <button onClick={()=>setPage(p=>Math.min(pagination.totalPages,p+1))} disabled={page>=pagination.totalPages} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}
      </div>
      {selected && <RefundDrawer refund={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// TAB: SETTLEMENTS
// ?????????????????????????????????????????????????????????????????????????????
function SettlementsTab() {
  const [settlements, setSettlements] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [note,        setNote]        = useState('');
  const [skip,        setSkip]        = useState(0);
  const [total,       setTotal]       = useState(0);
  const COUNT = 25;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/payments/settlements?count=${COUNT}&skip=${skip}`);
      setSettlements(r.data.data || []);
      setTotal(r.data.count || 0);
      if (r.data.message) setNote(r.data.message);
    } catch { toast.error('Failed to fetch settlements'); }
    finally { setLoading(false); }
  }, [skip]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-4">
      {note && (
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="text-xs text-blue-700 font-semibold">{note}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} settlements</p>
        <div className="flex items-center gap-2">
          <button onClick={fetch} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin':''}`}/>
          </button>
          <a href="https://dashboard.razorpay.com/app/settlements" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-800 transition-colors">
            <ExternalLink className="w-3.5 h-3.5"/> Open in Razorpay
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Settlement ID','Amount','UTR / Ref','Status','# Transactions','Date'].map(h=>(
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({length:5}).map((_,i)=>(
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-7 bg-gray-100 rounded animate-pulse"/></td></tr>
              )) : settlements.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center"><Landmark className="w-7 h-7 text-gray-300"/></div>
                    <p className="text-sm text-gray-400">No settlements data available</p>
                    <a href="https://dashboard.razorpay.com/app/settlements" target="_blank" rel="noopener noreferrer" className="text-xs text-primary-700 font-bold hover:underline flex items-center gap-1">View in Razorpay <ExternalLink className="w-3 h-3"/></a>
                  </div>
                </td></tr>
              ) : settlements.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-gray-600">{s.id}</span>
                      <CopyBtn text={s.id}/>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-sm font-extrabold text-gray-900">{RS}{fmt((s.amount||0)/100)}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs font-mono text-gray-600">{s.utr||'—'}</span></td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${s.status==='processed'?'bg-green-50 text-green-700 border-green-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-sm text-gray-700 font-semibold">{s.settlement_transfer_count||'—'}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-gray-500">{s.created_at ? fmtDShort(s.created_at) : '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > COUNT && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">{skip+1}–{Math.min(skip+COUNT, skip+settlements.length)} of {total}</p>
            <div className="flex gap-1.5">
              <button onClick={()=>setSkip(s=>Math.max(0,s-COUNT))} disabled={skip===0} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
              <button onClick={()=>setSkip(s=>s+COUNT)} disabled={settlements.length<COUNT} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// TAB: DISPUTES
// ?????????????????????????????????????????????????????????????????????????????
function DisputesTab() {
  const [disputes, setDisputes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [note,     setNote]     = useState('');
  const [skip,     setSkip]     = useState(0);
  const [total,    setTotal]    = useState(0);
  const COUNT = 25;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/payments/disputes?count=${COUNT}&skip=${skip}`);
      setDisputes(r.data.data || []);
      setTotal(r.data.count || 0);
      if (r.data.message) setNote(r.data.message);
    } catch { toast.error('Failed to fetch disputes'); }
    finally { setLoading(false); }
  }, [skip]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-4">
      {note && (
        <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0"/>
          <p className="text-xs text-blue-700 font-semibold">{note}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {disputes.filter(d => d.status === 'open').length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600"/>
              <span className="text-xs font-bold text-red-700">{disputes.filter(d=>d.status==='open').length} open dispute{disputes.filter(d=>d.status==='open').length>1?'s':''} — action needed</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetch} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading?'animate-spin':''}`}/>
          </button>
          <a href="https://dashboard.razorpay.com/app/disputes" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-900 text-white rounded-xl text-xs font-bold hover:bg-primary-800 transition-colors">
            <ExternalLink className="w-3.5 h-3.5"/> Open in Razorpay
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Dispute ID','Payment ID','Amount','Reason','Status','Phase','Respond By'].map(h=>(
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({length:5}).map((_,i)=>(
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-7 bg-gray-100 rounded animate-pulse"/></td></tr>
              )) : disputes.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center"><ShieldAlert className="w-7 h-7 text-green-400"/></div>
                    <p className="text-sm text-gray-900 font-semibold">No disputes</p>
                    <p className="text-xs text-gray-400">Your account has no disputes — great!</p>
                  </div>
                </td></tr>
              ) : disputes.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-gray-600">{d.id?.slice(0,14)}...</span>
                      <CopyBtn text={d.id}/>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-gray-600">{d.payment_id?.slice(0,12)}...</span>
                      <CopyBtn text={d.payment_id}/>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-sm font-extrabold text-gray-900">{RS}{fmt((d.amount||0)/100)}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-gray-700">{d.reason_code||d.reason||'—'}</span></td>
                  <td className="px-5 py-3.5"><DispBadge status={d.status}/></td>
                  <td className="px-5 py-3.5"><span className="text-xs text-gray-600">{d.phase||'—'}</span></td>
                  <td className="px-5 py-3.5">
                    {d.respond_by ? (
                      <span className={`text-xs font-bold ${new Date(d.respond_by*1000) < new Date() ? 'text-red-600':'text-gray-700'}`}>
                        {fmtDShort(d.respond_by)}
                      </span>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > COUNT && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">{skip+1}–{Math.min(skip+COUNT, skip+disputes.length)} of {total}</p>
            <div className="flex gap-1.5">
              <button onClick={()=>setSkip(s=>Math.max(0,s-COUNT))} disabled={skip===0} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
              <button onClick={()=>setSkip(s=>s+COUNT)} disabled={disputes.length<COUNT} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????
// ROOT PAGE
// ?????????????????????????????????????????????????????????????????????????????
export default function RazorpayModulePage() {
  const [activeTab,      setActiveTab]      = useState('overview');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundPrefill,   setRefundPrefill]   = useState(null);
  const [refundsKey,      setRefundsKey]      = useState(0); // force RefundsTab remount on success

  const openRefund = (prefillPayment = null) => {
    setRefundPrefill(prefillPayment);
    setShowRefundModal(true);
  };
  const closeRefund = () => { setShowRefundModal(false); setRefundPrefill(null); };
  const onRefundSuccess = () => { setRefundsKey(k => k + 1); };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Razorpay payment gateway — full control panel</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-3.5 h-3.5"/> Razorpay Dashboard
          </a>
          <button onClick={() => openRefund(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-900 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors shadow-sm">
            <RotateCcw className="w-4 h-4"/> Initiate Refund
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-full overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview'    && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'payments'    && <PaymentsTab onRefund={p => openRefund(p)} />}
        {activeTab === 'refunds'     && <RefundsTab key={refundsKey} onInitiate={() => openRefund(null)} />}
        {activeTab === 'settlements' && <SettlementsTab />}
        {activeTab === 'disputes'    && <DisputesTab />}
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <InitiateRefundModal
          prefillPayment={refundPrefill}
          onClose={closeRefund}
          onSuccess={onRefundSuccess}
        />
      )}
    </div>
  );
}
