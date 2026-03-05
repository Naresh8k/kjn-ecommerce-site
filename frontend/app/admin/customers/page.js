'use client';
import { useEffect, useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, ShoppingBag, X, ShoppingCart, Package } from 'lucide-react';
import api from '@/lib/api';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminCustomersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => { fetchUsers(); }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (search.trim()) params.set('search', search.trim());
            const res = await api.get(`/admin/users?${params}`);
            setUsers(res.data.data || []);
            setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const openDetail = async (user) => {
        setSelected(user);
        setDetailLoading(true);
        try {
            const res = await api.get(`/admin/users/${user.id}`);
            setDetail(res.data.data);
        } catch {
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => { setSelected(null); setDetail(null); };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading font-extrabold text-3xl text-gray-900 mb-1">Customers</h1>
                <p className="text-sm text-gray-500">{pagination.total} registered customers</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-primary-900 focus:outline-none font-medium"
                    />
                </div>
                <button type="submit" className="px-5 py-2.5 bg-primary-900 text-white text-sm font-bold rounded-xl hover:bg-primary-800 transition-colors">
                    Search
                </button>
            </form>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Spent</th>
                                <th className="text-center px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Verified</th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        {Array(7).fill(0).map((__, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? '60%' : '40%' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center">
                                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 font-semibold">No customers found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id} onClick={() => openDetail(u)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 font-medium">{u.phone || '\u2014'}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 font-medium">{u.email || '\u2014'}</td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-700">
                                                <ShoppingBag className="w-3.5 h-3.5" /> {u._count?.orders || 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm font-extrabold text-gray-900">
                                            {RS}{fmt(u.totalSpent || 0)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {u.isVerified ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500 font-medium">
                                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold">
                            Page {page} of {pagination.totalPages} ({pagination.total} total)
                        </p>
                        <div className="flex gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Detail Drawer */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={closeDetail}>
                    <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-white font-bold">
                                    {selected.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-heading font-extrabold text-lg text-gray-900">{selected.name}</p>
                                    <p className="text-xs text-gray-500">{selected.phone || selected.email}</p>
                                </div>
                            </div>
                            <button onClick={closeDetail} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-900 rounded-full animate-spin" />
                            </div>
                        ) : detail ? (
                            <div className="p-6 space-y-6">
                                {/* Customer Info */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Phone', value: detail.phone || '\u2014' },
                                        { label: 'Email', value: detail.email || '\u2014' },
                                        { label: 'Verified', value: detail.isVerified ? 'Yes' : 'No' },
                                        { label: 'Joined', value: new Date(detail.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                                            <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Orders */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShoppingBag className="w-4 h-4 text-primary-900" />
                                        <h3 className="font-heading font-bold text-base text-gray-900">Orders ({detail.orders?.length || 0})</h3>
                                    </div>
                                    {(!detail.orders || detail.orders.length === 0) ? (
                                        <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">No orders yet</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {detail.orders.map(order => (
                                                <div key={order.id} className="border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-sm font-extrabold text-gray-900">#{order.orderNumber}</p>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span className="font-bold text-gray-900">{RS}{fmt(order.totalAmount)}</span>
                                                    </div>
                                                    {order.items?.length > 0 && (
                                                        <div className="border-t border-gray-50 pt-2 mt-1 space-y-1">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between text-xs text-gray-600">
                                                                    <span className="truncate flex-1">{item.productName || item.product?.name || 'Product'} x{item.quantity}</span>
                                                                    <span className="font-semibold ml-2">{RS}{fmt(item.unitPrice || item.totalPrice)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Cart */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShoppingCart className="w-4 h-4 text-primary-900" />
                                        <h3 className="font-heading font-bold text-base text-gray-900">Cart ({detail.cart?.items?.length || 0} items)</h3>
                                    </div>
                                    {(!detail.cart?.items || detail.cart.items.length === 0) ? (
                                        <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">Cart is empty</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {detail.cart.items.map(item => (
                                                <div key={item.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                                                    {item.product?.images?.[0]?.image || item.product?.image ? (
                                                        <img src={item.product.images[0]?.image || item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name}</p>
                                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-extrabold text-primary-900">{RS}{fmt(item.product?.sellingPrice)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-400 text-sm">Failed to load customer details</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
