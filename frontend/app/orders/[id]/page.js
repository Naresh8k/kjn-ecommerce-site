'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, MapPin, ChevronRight, Phone, AlertCircle,
  CheckCircle, Clock, Truck, XCircle, RotateCcw,
  ArrowLeft, MessageCircle, CreditCard, Tag, Download, FileText,
  Star, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import WriteReview from '@/components/product/WriteReview';

const RS = '₹';
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23D1D5DB' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

function getItemImage(item) {
  return item.productImage
    || item.product?.images?.[0]?.image
    || item.product?.image
    || NO_IMG;
}

const STATUS_META = {
  PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock, dot: 'bg-amber-400' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-green-50 text-green-700 border-green-200', Icon: CheckCircle, dot: 'bg-green-500' },
  PROCESSING: { label: 'Processing', cls: 'bg-blue-50 text-blue-700 border-blue-200', Icon: Package, dot: 'bg-blue-500' },
  SHIPPED: { label: 'Shipped', cls: 'bg-teal-50 text-teal-700 border-teal-200', Icon: Truck, dot: 'bg-teal-500' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'bg-orange-50 text-orange-700 border-orange-200', Icon: Truck, dot: 'bg-orange-500' },
  DELIVERED: { label: 'Delivered', cls: 'bg-primary-50 text-primary-900 border-primary-200', Icon: CheckCircle, dot: 'bg-primary-900' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle, dot: 'bg-red-500' },
  RETURNED: { label: 'Returned', cls: 'bg-purple-50 text-purple-700 border-purple-200', Icon: RotateCcw, dot: 'bg-purple-500' },
  REFUNDED: { label: 'Refunded', cls: 'bg-purple-50 text-purple-700 border-purple-200', Icon: RotateCcw, dot: 'bg-purple-500' },
};

const STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const STEP_INDEX = STEPS.reduce((acc, s, i) => ({ ...acc, [s.key]: i }), {});

function Stepper({ status }) {
  const current = STEP_INDEX[status] ?? -1;
  const cancelled = status === 'CANCELLED';
  return (
    <div className="mt-5">
      <div className="relative flex items-start justify-between">
        {/* Track background */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0" />
        {/* Track filled */}
        {!cancelled && current >= 0 && (
          <div
            className="absolute top-4 left-4 h-0.5 bg-primary-900 z-0 transition-all duration-700"
            style={{ width: `calc(${(current / (STEPS.length - 1)) * 100}% - 8px)` }}
          />
        )}
        {STEPS.map((step, i) => {
          const done = !cancelled && i < current;
          const active = !cancelled && i === current;
          const StepIcon = step.icon;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
              <div className={
                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ' + (
                  cancelled ? 'bg-gray-100 border-gray-200' :
                    done ? 'bg-primary-900 border-primary-900' :
                      active ? 'bg-primary-900 border-primary-900 ring-4 ring-primary-900/20' :
                        'bg-white border-gray-200'
                )
              }>
                {done ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : active ? (
                  <StepIcon className="w-4 h-4 text-white" />
                ) : (
                  <div className={'w-2 h-2 rounded-full ' + (cancelled ? 'bg-gray-300' : 'bg-gray-300')} />
                )}
              </div>
              <span className={
                'text-[10px] font-bold text-center leading-tight max-w-[52px] ' + (
                  (done || active) && !cancelled ? 'text-primary-900' : 'text-gray-400'
                )
              }>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {cancelled && (
        <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs font-bold text-red-600">This order has been cancelled.</p>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={'bg-white rounded-2xl border border-gray-100 overflow-hidden ' + className}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50">
        <Icon className="w-4 h-4 text-primary-900 flex-shrink-0" />
        <h2 className="font-heading font-extrabold text-sm text-gray-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Interactive star picker shown on delivered items before reviewing
function StarPicker({ onPick }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="mt-2">
      <p className="text-[10px] text-gray-400 font-semibold mb-1">Tap to rate</p>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onPick(s)}
            className="p-0.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
          >
            <Star
              className="w-6 h-6 transition-colors duration-100"
              style={{
                fill: s <= hovered ? '#F59E0B' : 'none',
                color: s <= hovered ? '#F59E0B' : '#D1D5DB',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-pulse">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="h-4 w-40 bg-gray-200 rounded-full mb-3" />
        <div className="h-6 w-48 bg-gray-200 rounded-full mb-2" />
        <div className="h-3 w-32 bg-gray-100 rounded-full" />
      </div>
      <div className="container mx-auto px-4 pt-5 space-y-4">
        <div className="h-32 bg-white rounded-2xl border border-gray-100" />
        <div className="h-48 bg-white rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 bg-white rounded-2xl border border-gray-100" />
          <div className="h-40 bg-white rounded-2xl border border-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewItem, setReviewItem] = useState(null); // { productId, productName }
  // Map of productId -> { canReview, reason, existingReview }
  const [itemReviews, setItemReviews] = useState({});

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.data))
      .catch(() => router.push('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  // Once order loads and is DELIVERED, fetch review eligibility for each item
  useEffect(() => {
    if (!order || order.status !== 'DELIVERED') return;
    const productIds = [...new Set(order.items?.map(i => i.productId).filter(Boolean))];
    Promise.all(
      productIds.map(pid =>
        api.get(`/reviews/can-review/${pid}`)
          .then(r => ({ pid, data: r.data }))
          .catch(() => ({ pid, data: { canReview: false, reason: 'error' } }))
      )
    ).then(results => {
      const map = {};
      results.forEach(({ pid, data }) => { map[pid] = data; });
      setItemReviews(map);
    });
  }, [order]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    } finally { setCancelling(false); }
  };

  const handleDownloadInvoice = async () => {
    try {
      const r = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `Invoice-${order.orderNumber}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded!');
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) return <SkeletonDetail />;
  if (!order) return null;

  const meta = STATUS_META[order.status] || STATUS_META.PENDING;
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const subtotal = parseFloat(order.subtotal || 0);
  const discount = parseFloat(order.discountAmount || 0);
  const shipping = parseFloat(order.shippingCharge || 0);
  const gst = parseFloat(order.gstAmount || 0);
  const total = parseFloat(order.totalAmount || 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">

      {/* Sticky top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link href="/orders" className="flex items-center gap-1 hover:text-primary-900 font-semibold transition-colors">
              <ArrowLeft className="w-3 h-3" /> My Orders
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="font-bold text-gray-800">#{order.orderNumber}</span>
          </div>
          {/* Title + badge + actions */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-heading font-extrabold text-base text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className={'inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full border flex-shrink-0 ' + meta.cls}>
                <span className={'w-1.5 h-1.5 rounded-full ' + meta.dot} />
                {meta.label}
              </span>
              {!['PENDING', 'CANCELLED'].includes(order.status) && (
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-extrabold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Invoice
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-extrabold transition-colors disabled:opacity-60"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {cancelling ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
              <a
                href={`https://wa.me/9440658294?text=Hi, I need help with order %23${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-extrabold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-4 space-y-4">

        {/* Stepper card */}
        <SectionCard title="Order Status" icon={Clock}>
          {/* AWB chip */}
          {order.awbNumber && (
            <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 mb-4">
              <Package className="w-4 h-4 text-primary-900 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-primary-700 font-semibold uppercase tracking-wide">AWB Number</p>
                <p className="text-xs font-extrabold text-primary-900">
                  {order.awbNumber}{order.trackingId ? ` · Tracking: ${order.trackingId}` : ''}
                </p>
              </div>
            </div>
          )}
          <Stepper status={order.status} />
        </SectionCard>

        {/* Items card */}
        <SectionCard title={`Order Items (${order.items?.length ?? 0})`} icon={Package}>
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={item.id}>
                <div className="flex gap-3 items-start">
                  <Link
                    href={item.product?.slug ? `/products/${item.product.slug}` : '#'}
                    className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={getItemImage(item)}
                      alt={item.productName}
                      onError={e => { e.currentTarget.src = NO_IMG; }}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.product?.slug ? `/products/${item.product.slug}` : '#'}
                      className="font-bold text-sm text-gray-900 leading-snug mb-0.5 hover:text-primary-900 transition-colors line-clamp-2 block"
                    >
                      {item.productName}
                    </Link>
                    {item.variantInfo && (
                      <p className="text-[11px] text-gray-400 font-semibold mb-1">{item.variantInfo}</p>
                    )}
                    <p className="text-xs text-gray-500 font-semibold">
                      Qty {item.quantity} × {RS}{fmt(item.unitPrice)}
                    </p>
                    {order.status === 'DELIVERED' && item.productId && (() => {
                      const rev = itemReviews[item.productId];
                      // Already reviewed — show submitted stars
                      if (rev?.reason === 'already_reviewed') {
                        const rating = rev.existingReview?.rating || 0;
                        return (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className="w-3.5 h-3.5"
                                  style={{ fill: s <= rating ? '#F59E0B' : 'none', color: s <= rating ? '#F59E0B' : '#D1D5DB' }} />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5" /> Reviewed
                            </span>
                          </div>
                        );
                      }
                      // Can review — show interactive stars
                      if (rev?.canReview) {
                        return (
                          <StarPicker
                            onPick={s => setReviewItem({ productId: item.productId, productName: item.productName, initialRating: s })}
                          />
                        );
                      }
                      // Still loading or no purchase — show nothing
                      return null;
                    })()}
                  </div>
                  <span className="font-extrabold text-sm text-gray-900 flex-shrink-0 pt-0.5">
                    {RS}{fmt(item.totalPrice)}
                  </span>
                </div>
                {idx < order.items.length - 1 && (
                  <div className="border-b border-gray-50 mt-4" />
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Price + Address — 2 col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Payment Summary */}
          <SectionCard title="Payment Summary" icon={CreditCard}>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold">Subtotal</span>
                <span className="font-bold text-gray-900">{RS}{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-semibold flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    {order.couponCode ? (
                      <span>
                        Coupon{' '}
                        <span className="font-extrabold tracking-wide bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md text-[11px]">
                          {order.couponCode}
                        </span>
                      </span>
                    ) : 'Discount'}
                  </span>
                  <span className="font-bold text-green-600">-{RS}{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-semibold">Shipping</span>
                <span className={'font-bold ' + (shipping === 0 ? 'text-green-600' : 'text-gray-900')}>
                  {shipping === 0 ? 'FREE' : RS + fmt(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-semibold">GST (included)</span>
                <span className="text-gray-400 font-semibold">{RS}{gst.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-gray-100 pt-2.5 flex justify-between items-center">
                <span className="font-heading font-extrabold text-sm text-gray-900">Total Paid</span>
                <span className="font-heading font-extrabold text-lg text-primary-900">{RS}{fmt(total)}</span>
              </div>
            </div>
            {/* Payment method chip */}
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
              <span className="text-xs text-gray-500 font-semibold">Payment</span>
              <span className="text-xs font-extrabold text-gray-800">
                {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
              </span>
            </div>
            {/* Payment status chip */}
            {order.paymentStatus && (
              <div className={'mt-2 flex items-center justify-between rounded-xl px-4 py-2.5 ' + (
                order.paymentStatus === 'PAID'
                  ? 'bg-green-50'
                  : order.paymentStatus === 'PENDING' ? 'bg-amber-50' : 'bg-red-50'
              )}>
                <span className="text-xs text-gray-500 font-semibold">Payment Status</span>
                <span className={'text-xs font-extrabold ' + (
                  order.paymentStatus === 'PAID'
                    ? 'text-green-700'
                    : order.paymentStatus === 'PENDING' ? 'text-amber-700' : 'text-red-700'
                )}>
                  {order.paymentStatus}
                </span>
              </div>
            )}
          </SectionCard>

          {/* Delivery Address */}
          <SectionCard title="Delivery Address" icon={MapPin}>
            {order.shippingAddress ? (
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary-900" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900 mb-1">{order.shippingAddress.name}</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                    {order.shippingAddress.pincode}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 font-semibold">
                    <Phone className="w-3 h-3" />
                    {order.shippingAddress.phone}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No address info available.</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Rate & Review Modal ── */}
      {reviewItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setReviewItem(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-0.5">Reviewing</p>
                <h3 className="font-extrabold text-sm text-gray-900 line-clamp-1">{reviewItem.productName}</h3>
              </div>
              <button
                onClick={() => setReviewItem(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5">
              <WriteReview
                productId={reviewItem.productId}
                initialRating={reviewItem.initialRating || 0}
                onReviewAdded={(review) => {
                  // Mark this item as already reviewed in local state
                  setItemReviews(prev => ({
                    ...prev,
                    [reviewItem.productId]: {
                      canReview: false,
                      reason: 'already_reviewed',
                      existingReview: review,
                    },
                  }));
                  setReviewItem(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}