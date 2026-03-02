'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package, ChevronRight, ShoppingBag, Clock,
  CheckCircle, Truck, XCircle, RotateCcw, Search
} from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23D1D5DB' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

function getItemImage(item) {
  return item.productImage
    || item.product?.images?.[0]?.image
    || item.product?.image
    || NO_IMG;
}

const STATUS_META = {
  PENDING:         { label: 'Pending',          cls: 'bg-amber-50 text-amber-600 border-amber-200',   dot: 'bg-amber-400',   Icon: Clock       },
  CONFIRMED:       { label: 'Confirmed',         cls: 'bg-green-50 text-green-600 border-green-200',   dot: 'bg-green-500',   Icon: CheckCircle },
  PROCESSING:      { label: 'Processing',        cls: 'bg-blue-50 text-blue-600 border-blue-200',      dot: 'bg-blue-500',    Icon: Package     },
  SHIPPED:         { label: 'Shipped',           cls: 'bg-teal-50 text-teal-600 border-teal-200',      dot: 'bg-teal-500',    Icon: Truck       },
  OUT_FOR_DELIVERY:{ label: 'Out for Delivery',  cls: 'bg-orange-50 text-orange-600 border-orange-200',dot: 'bg-orange-500',  Icon: Truck       },
  DELIVERED:       { label: 'Delivered',         cls: 'bg-primary-50 text-primary-900 border-primary-200', dot: 'bg-primary-900', Icon: CheckCircle },
  CANCELLED:       { label: 'Cancelled',         cls: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500',     Icon: XCircle     },
  RETURNED:        { label: 'Returned',          cls: 'bg-purple-50 text-purple-600 border-purple-200',dot: 'bg-purple-500',  Icon: RotateCcw   },
  REFUNDED:        { label: 'Refunded',          cls: 'bg-purple-50 text-purple-600 border-purple-200',dot: 'bg-purple-500',  Icon: RotateCcw   },
};

const FILTER_TABS = [
  { key: 'ALL',       label: 'All Orders'  },
  { key: 'ACTIVE',    label: 'Active'      },
  { key: 'DELIVERED', label: 'Delivered'   },
  { key: 'CANCELLED', label: 'Cancelled'   },
];

const ACTIVE_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY'];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3.5 w-32 bg-gray-200 rounded-full" />
          <div className="h-3 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="flex gap-3">
        {[1,2,3].map(i => <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />)}
      </div>
      <div className="flex justify-between pt-1">
        <div className="h-3.5 w-20 bg-gray-100 rounded-full" />
        <div className="h-4 w-24 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={'inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border ' + meta.cls}>
      <span className={'w-1.5 h-1.5 rounded-full flex-shrink-0 ' + meta.dot} />
      {meta.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');
  const [search,  setSearch]  = useState('');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/orders')
      .then(r => setOrders(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter === 'ACTIVE')    list = list.filter(o => ACTIVE_STATUSES.includes(o.status));
    if (filter === 'DELIVERED') list = list.filter(o => o.status === 'DELIVERED');
    if (filter === 'CANCELLED') list = list.filter(o => ['CANCELLED','RETURNED','REFUNDED'].includes(o.status));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.items?.some(i => i.productName?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, filter, search]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Page header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-900" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-lg text-gray-900 leading-tight">My Orders</h1>
                {!loading && (
                  <p className="text-[11px] text-gray-400 font-semibold">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or product name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none font-medium bg-gray-50"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={'flex-shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border-2 transition-all ' + (
                  filter === tab.key
                    ? 'bg-primary-900 border-primary-900 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-900 hover:text-primary-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-5">

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-gray-800 mb-2">
              {search || filter !== 'ALL' ? 'No matching orders' : 'No orders yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              {search || filter !== 'ALL'
                ? 'Try a different search or filter.'
                : 'Looks like you have not placed any orders yet. Start shopping!'}
            </p>
            {filter === 'ALL' && !search && (
              <Link
                href="/products"
                className="flex items-center gap-2 px-6 py-3 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Products
              </Link>
            )}
          </div>
        )}

        {/* Orders list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(order => {
              const meta = STATUS_META[order.status];
              const isActive    = ACTIVE_STATUSES.includes(order.status);
              const isDelivered = order.status === 'DELIVERED';
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                  <div className="bg-white rounded-2xl border border-gray-100 group-hover:border-primary-900/30 group-hover:shadow-medium transition-all duration-200 overflow-hidden">

                    {/* Top accent bar for active orders */}
                    {isActive && (
                      <div className="h-1 bg-gradient-to-r from-primary-900 to-primary-500" />
                    )}

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-heading font-extrabold text-sm text-gray-900">
                              #{order.orderNumber}
                            </span>
                            {isDelivered && (
                              <span className="text-[10px] font-extrabold bg-primary-50 text-primary-900 px-2 py-0.5 rounded-full border border-primary-200">
                                ✓ Delivered
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-semibold">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={order.status} />
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-900 transition-colors" />
                        </div>
                      </div>

                      {/* Product thumbnails */}
                      <div className="flex gap-2.5 mb-4">
                      {order.items?.slice(0, 4).map((item, idx) => {
                          const isExtra = idx === 3 && order.items.length > 4;
                          return (
                            <div key={item.id} className="relative flex-shrink-0">
                              <img
                                src={getItemImage(item)}
                                alt={item.productName}
                                onError={e => { e.currentTarget.src = NO_IMG; }}
                                className="w-14 h-14 rounded-xl object-cover border border-gray-100 bg-gray-50"
                              />
                              {isExtra && (
                                <div className="absolute inset-0 bg-gray-900/60 rounded-xl flex items-center justify-center">
                                  <span className="text-white text-xs font-extrabold">+{order.items.length - 3}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Item names preview */}
                      <p className="text-xs text-gray-500 font-semibold mb-3 line-clamp-1">
                        {order.items?.map(i => i.productName).join(', ')}
                      </p>

                      {/* Footer row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-semibold">
                            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400 font-semibold">
                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                          </span>
                        </div>
                        <span className="font-heading font-extrabold text-base text-primary-900">
                          {RS}{fmt(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}