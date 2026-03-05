'use client';
import { useState, useEffect, useCallback } from 'react';
import {
    Zap, Plus, Search, Trash2, Edit2, Clock, X,
    Package, AlertCircle, CheckCircle, Calendar,
    ChevronDown, Timer, TrendingDown
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

/* ─── Countdown component ──────────────────── */
function Countdown({ endDate }) {
    const [timeLeft, setTimeLeft] = useState({});
    useEffect(() => {
        const calc = () => {
            const diff = new Date(endDate) - new Date();
            if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
            return {
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
                expired: false,
            };
        };
        setTimeLeft(calc());
        const t = setInterval(() => setTimeLeft(calc()), 1000);
        return () => clearInterval(t);
    }, [endDate]);

    if (timeLeft.expired) return <span className="text-red-500 font-bold text-xs">EXPIRED</span>;

    return (
        <div className="flex gap-1.5">
            {[
                { val: timeLeft.d, label: 'd' },
                { val: timeLeft.h, label: 'h' },
                { val: timeLeft.m, label: 'm' },
                { val: timeLeft.s, label: 's' },
            ].map(({ val, label }) => (
                <div key={label} className="bg-gray-900 text-white rounded-lg px-2 py-1 text-center min-w-[36px]">
                    <div className="text-sm font-bold leading-tight">{String(val).padStart(2, '0')}</div>
                    <div className="text-[9px] uppercase text-gray-400 leading-tight">{label}</div>
                </div>
            ))}
        </div>
    );
}

/* ─── Product Picker Modal ─────────────────── */
function ProductPicker({ onToggle, selectedIds, onClose }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/products')
            .then(r => setProducts(r.data.data || []))
            .catch(() => toast.error('Failed to load products'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-heading font-bold text-lg text-gray-900">Select Products</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {selectedIds.length === 0 ? 'Tap products to add them' : `${selectedIds.length} product(s) selected`}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        />
                    </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-900 rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">No products found</div>
                    ) : (
                        filtered.map(p => {
                            const isSelected = selectedIds.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => onToggle(p)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                        isSelected
                                            ? 'bg-orange-50 border-orange-300 shadow-sm'
                                            : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        {(p.image || p.images?.[0]?.image) ? (
                                            <img src={p.image || p.images[0].image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-5 h-5 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400 line-through">{RS}{fmt(p.mrp)}</span>
                                            <span className="text-xs font-bold text-green-600">{RS}{fmt(p.sellingPrice)}</span>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Stock: {p.stockQuantity}</span>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                        isSelected ? 'bg-orange-500' : 'border-2 border-gray-300'
                                    }`}>
                                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'None selected'}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function FlashSalesPage() {
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');

    // Create modal state
    const [showCreate, setShowCreate] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    // selectedProducts: array of { ...productData, flashPrice: string }
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [endDate, setEndDate] = useState('');
    const [saving, setSaving] = useState(false);

    // Edit modal state
    const [editItem, setEditItem] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [editEndDate, setEditEndDate] = useState('');

    const fetchFlashSales = useCallback(async () => {
        try {
            const r = await api.get(`/admin/flash-sales?status=${filter}`);
            setFlashSales(r.data.data || []);
        } catch { toast.error('Failed to load flash sales'); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { fetchFlashSales(); }, [fetchFlashSales]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (selectedProducts.length === 0) return toast.error('Select at least one product');
        if (!endDate) return toast.error('End date is required');
        const missingPrice = selectedProducts.find(p => !p.flashPrice || isNaN(parseFloat(p.flashPrice)));
        if (missingPrice) return toast.error(`Enter a flash price for "${missingPrice.name}"`);
        setSaving(true);
        try {
            await api.post('/admin/flash-sales', {
                products: selectedProducts.map(p => ({ id: p.id, flashPrice: parseFloat(p.flashPrice) })),
                endDate,
            });
            toast.success(`Flash sale created for ${selectedProducts.length} product(s)!`);
            setShowCreate(false);
            setSelectedProducts([]);
            setEndDate('');
            fetchFlashSales();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create');
        } finally { setSaving(false); }
    };

    const updateProductFlashPrice = (productId, value) => {
        setSelectedProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, flashPrice: value } : p)
        );
    };

    const toggleProduct = (product) => {
        setSelectedProducts(prev => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) return prev.filter(p => p.id !== product.id);
            return [...prev, { ...product, flashPrice: '' }];
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this flash sale?')) return;
        try {
            await api.delete(`/admin/flash-sales/${id}`);
            toast.success('Flash sale deleted');
            fetchFlashSales();
        } catch { toast.error('Failed to delete'); }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editItem) return;
        try {
            await api.put(`/admin/flash-sales/${editItem.id}`, {
                flashPrice: parseFloat(editPrice),
                endDate: editEndDate,
            });
            toast.success('Flash sale updated');
            setEditItem(null);
            fetchFlashSales();
        } catch { toast.error('Failed to update'); }
    };

    const handleToggle = async (id, isActive) => {
        try {
            await api.put(`/admin/flash-sales/${id}`, { isActive: !isActive });
            toast.success(isActive ? 'Flash sale paused' : 'Flash sale activated');
            fetchFlashSales();
        } catch { toast.error('Failed to update'); }
    };

    const openEdit = (item) => {
        setEditItem(item);
        setEditPrice(item.flashPrice);
        setEditEndDate(new Date(item.endDate).toISOString().slice(0, 16));
    };

    const activeCount = flashSales.filter(fs => fs.isActive && new Date(fs.endDate) > new Date()).length;
    const expiredCount = flashSales.filter(fs => !fs.isActive || new Date(fs.endDate) <= new Date()).length;

    // Minimum datetime for date picker = now
    const minDate = new Date().toISOString().slice(0, 16);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-extrabold text-3xl text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        Flash Sales
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage limited-time deals and discounts</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-4 h-4" /> Create Flash Sale
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active</p>
                            <p className="font-heading font-extrabold text-2xl text-gray-900">{activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expired</p>
                            <p className="font-heading font-extrabold text-2xl text-gray-900">{expiredCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</p>
                            <p className="font-heading font-extrabold text-2xl text-gray-900">{flashSales.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'active', label: 'Active', icon: CheckCircle },
                    { key: 'expired', label: 'Expired', icon: Clock },
                    { key: 'all', label: 'All', icon: Zap },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setFilter(tab.key); setLoading(true); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === tab.key
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Flash Sales Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
                </div>
            ) : flashSales.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">No Flash Sales</h3>
                    <p className="text-sm text-gray-500 mb-4">Create your first flash sale to boost sales with limited-time deals</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm"
                    >
                        Create Flash Sale
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {flashSales.map(fs => {
                        const product = fs.product;
                        const isExpired = !fs.isActive || new Date(fs.endDate) <= new Date();
                        const discountPct = product ? Math.round((1 - parseFloat(fs.flashPrice) / parseFloat(product.mrp)) * 100) : 0;
                        const img = product?.image || product?.images?.[0]?.image;

                        return (
                            <div
                                key={fs.id}
                                className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-lg group ${isExpired ? 'border-gray-200 opacity-75' : 'border-orange-200 shadow-sm'
                                    }`}
                            >
                                {/* Product Image */}
                                <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                    {img ? (
                                        <img src={img} alt={product?.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-12 h-12 text-gray-200" />
                                        </div>
                                    )}
                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        {!isExpired && (
                                            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> FLASH
                                            </span>
                                        )}
                                        {discountPct > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                                -{discountPct}%
                                            </span>
                                        )}
                                    </div>
                                    {isExpired && (
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <span className="bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg">EXPIRED</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <h3 className="font-semibold text-sm text-gray-900 truncate">{product?.name || 'Unknown Product'}</h3>

                                    {/* Prices */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 line-through">{RS}{fmt(product?.mrp)}</span>
                                        <span className="text-xs text-gray-400 line-through">{RS}{fmt(product?.sellingPrice)}</span>
                                        <span className="text-lg font-extrabold text-orange-600">{RS}{fmt(fs.flashPrice)}</span>
                                    </div>

                                    {/* Countdown */}
                                    {!isExpired && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                                                <Timer className="w-3 h-3" /> Ends in
                                            </p>
                                            <Countdown endDate={fs.endDate} />
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => handleToggle(fs.id, fs.isActive)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${fs.isActive
                                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                }`}
                                        >
                                            {fs.isActive ? 'Pause' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => openEdit(fs)}
                                            className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(fs.id)}
                                            className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ CREATE MODAL ═══ */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-heading font-bold text-xl text-gray-900">Create Flash Sale</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Select products and set flash pricing</p>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            {/* Selected Products */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                    Products ({selectedProducts.length} selected)
                                </label>
                                {/* Per-product price rows */}
                                {selectedProducts.length > 0 && (
                                    <div className="space-y-2 mb-3 max-h-64 overflow-y-auto pr-1">
                                        {selectedProducts.map(p => {
                                            const discountPct = p.flashPrice && parseFloat(p.flashPrice) > 0
                                                ? Math.round((1 - parseFloat(p.flashPrice) / parseFloat(p.mrp)) * 100)
                                                : null;
                                            return (
                                                <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                                    {/* Product info row */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-gray-200">
                                                            {(p.image || p.images?.[0]?.image) ? (
                                                                <img src={p.image || p.images[0].image} alt="" className="w-full h-full object-cover" />
                                                            ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] text-gray-400">MRP: {RS}{fmt(p.mrp)}</span>
                                                                <span className="text-[11px] text-gray-400">Sell: {RS}{fmt(p.sellingPrice)}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedProducts(prev => prev.filter(x => x.id !== p.id))}
                                                            className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    {/* Flash price input */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{RS}</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max={p.mrp}
                                                                value={p.flashPrice}
                                                                onChange={e => updateProductFlashPrice(p.id, e.target.value)}
                                                                placeholder="Flash price"
                                                                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white"
                                                            />
                                                        </div>
                                                        {discountPct !== null && discountPct > 0 && (
                                                            <span className="text-xs font-bold text-white bg-red-500 px-2 py-1.5 rounded-lg flex-shrink-0">
                                                                -{discountPct}% off
                                                            </span>
                                                        )}
                                                        {discountPct !== null && discountPct <= 0 && (
                                                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1.5 rounded-lg flex-shrink-0">
                                                                No discount
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowPicker(true)}
                                    className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> {selectedProducts.length > 0 ? 'Add More Products' : 'Add Products'}
                                </button>
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> End Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    min={minDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Creating...' : `Create Flash Sale (${selectedProducts.length} products)`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Picker */}
            {showPicker && (
                <ProductPicker
                    selectedIds={selectedProducts.map(p => p.id)}
                    onToggle={toggleProduct}
                    onClose={() => setShowPicker(false)}
                />
            )}

            {/* ═══ EDIT MODAL ═══ */}
            {editItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditItem(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-heading font-bold text-lg text-gray-900">Edit Flash Sale</h2>
                            <button onClick={() => setEditItem(null)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="p-5 space-y-4">
                            <p className="text-sm font-medium text-gray-700">{editItem.product?.name}</p>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Flash Price ({RS})</label>
                                <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400 outline-none" required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">End Date</label>
                                <input type="datetime-local" value={editEndDate} onChange={e => setEditEndDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-orange-400 outline-none" required />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
