'use client';
import { useEffect, useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, ShoppingBag, X, ShoppingCart, Package, Phone, Mail, Calendar, MapPin } from 'lucide-react';
import api from '@/lib/api';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

const statusColors = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    OUT_FOR_DELIVERY: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    RETURNED: 'bg-rose-50 text-rose-700 border-rose-200',
    REFUNDED: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function AdminCustomersPage() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 12;
    const [selectedUser, setSelectedUser] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const r = await api.get('/admin/users');
            const data = r.data.data || [];
            setUsers(data);
            setFiltered(data);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSearch = (e) => {
        const q = e.target.value.toLowerCase();
        setSearch(e.target.value);
        setPage(1);
        setFiltered(users.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.includes(q)
        ));
    };

    const openDetail = async (user) => {
        setSelectedUser(user);
        setDetailLoading(true);
        try {
            const r = await api.get(`/admin/users/${user.id}`);
            setDetail(r.data.data);
        } catch { setDetail(null); }
        finally { setDetailLoading(false); }
    };

    const closeDetail = () => { setSelectedUser(null); setDetail(null); };

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    // Stats
    const totalCustomers = users.length;
    const thisMonth = users.filter(u => {
        const d = new Date(u.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const withOrders = users.filter(u => (u._count?.orders || 0) > 0).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-heading font-extrabold text-3xl text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    Customers
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage your customer base and their orders</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</p>
                            <p className="font-heading font-extrabold text-2xl text-gray-900">{totalCustomers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">New This Month</p>
                            <p className="font-heading font-extrabold text-2xl text-gray-900">{thisMonth}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">With Orders</p>
                            <p className="font-heading font-extrabold text-2xl text-gray-900">{withOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                                <th className="text-center px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Orders</th>
                                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="text-right px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="skeleton h-10 rounded-lg" /></td></tr>
                                ))
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">No customers found</td></tr>
                            ) : (
                                paginated.map(u => {
                                    const colors = ['from-blue-500 to-blue-700', 'from-purple-500 to-purple-700', 'from-emerald-500 to-emerald-700', 'from-amber-500 to-amber-700', 'from-rose-500 to-rose-700'];
                                    const colorIdx = u.name ? u.name.charCodeAt(0) % colors.length : 0;
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => openDetail(u)}>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                        <span className="text-sm font-bold text-white">{u.name?.charAt(0)?.toUpperCase() || '?'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                                        <p className="text-[10px] text-gray-400 capitalize">{u.role?.toLowerCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    {u.email && <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {u.email}</p>}
                                                    {u.phone && <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-gray-400" /> {u.phone}</p>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                                                    <ShoppingBag className="w-3 h-3" /> {u._count?.orders || 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button className="text-xs font-semibold text-primary-600 hover:text-primary-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Details →
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Page {page} of {totalPages} · {filtered.length} customers</p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
                                <ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40">
                                <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={closeDetail}>
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-heading font-bold text-lg text-gray-900">Customer Details</h2>
                            <button onClick={closeDetail} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {detailLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-900 rounded-full animate-spin" />
                                </div>
                            ) : detail ? (
                                <>
                                    {/* Profile */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
                                            <span className="text-2xl font-bold text-white">{detail.name?.charAt(0)?.toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-heading font-bold text-xl text-gray-900">{detail.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                {detail.email && <span className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {detail.email}</span>}
                                                {detail.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {detail.phone}</span>}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Joined {new Date(detail.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    {detail.addresses?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5" /> Addresses
                                            </h4>
                                            <div className="space-y-2">
                                                {detail.addresses.map(a => (
                                                    <div key={a.id} className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                                                        <p className="font-semibold">{a.name} · {a.phone}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} — {a.pincode}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Order History */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ShoppingBag className="w-3.5 h-3.5" /> Order History ({detail.orders?.length || 0})
                                        </h4>
                                        {detail.orders?.length > 0 ? (
                                            <div className="space-y-2">
                                                {detail.orders.map(o => (
                                                    <div key={o.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold font-mono text-primary-700">#{o.orderNumber}</span>
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColors[o.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                                    {o.status?.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                                {o.items && ` · ${o.items.length} item${o.items.length !== 1 ? 's' : ''}`}
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-extrabold text-gray-900">{RS}{fmt(o.totalAmount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
                                        )}
                                    </div>

                                    {/* Cart */}
                                    {detail.cart?.items?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <ShoppingCart className="w-3.5 h-3.5" /> Current Cart ({detail.cart.items.length})
                                            </h4>
                                            <div className="space-y-1.5">
                                                {detail.cart.items.map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                                                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex-shrink-0">
                                                            {item.product?.image ? (
                                                                <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                                            ) : <Package className="w-full h-full p-2 text-gray-200" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.name}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-700">{RS}{fmt(item.priceAtAdd)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-gray-400 py-8">Failed to load details</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
