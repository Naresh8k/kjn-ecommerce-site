'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    LineChart, Line, AreaChart, Area,
    CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Calendar, BarChart3 } from 'lucide-react';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

const PRESETS = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
];

export default function RevenuePage() {
    const [daily, setDaily] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedPreset, setSelectedPreset] = useState(4); // 1 Year default
    const [chartType, setChartType] = useState('area'); // 'line' | 'area'

    useEffect(() => {
        loadRevenue();
    }, [selectedPreset]);

    const loadRevenue = async () => {
        setLoading(true);
        try {
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - PRESETS[selectedPreset].days);
            const res = await api.get(`/admin/revenue-report?from=${fromDate.toISOString()}&to=${new Date().toISOString()}`);
            const d = res.data.data;
            setDaily(d.dailyRevenue || []);
            setMonthly(d.monthlyRevenue || []);
            setStats({
                totalRevenue: d.totalRevenue || 0,
                totalOrders: d.totalOrders || 0,
                averageOrderValue: d.averageOrderValue || 0,
            });
        } catch (err) {
            console.error('Failed to load revenue data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-16 rounded-2xl" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
                </div>
                <div className="skeleton h-80 rounded-2xl" />
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl px-4 py-3 min-w-[140px]">
                <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                <p className="text-sm font-extrabold text-gray-900">{RS}{fmt(payload[0].value)}</p>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-extrabold text-3xl text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        Revenue Analytics
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Track your store&apos;s financial performance</p>
                </div>

                {/* Date Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESETS.map((p, idx) => (
                        <button
                            key={p.label}
                            onClick={() => setSelectedPreset(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPreset === idx
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        label: 'Total Revenue',
                        value: `${RS}${fmt(stats.totalRevenue)}`,
                        icon: DollarSign,
                        gradient: 'from-emerald-500 to-green-700',
                        bgLight: 'bg-emerald-50',
                        textColor: 'text-emerald-700'
                    },
                    {
                        label: 'Total Orders',
                        value: stats.totalOrders,
                        icon: ShoppingBag,
                        gradient: 'from-blue-500 to-blue-700',
                        bgLight: 'bg-blue-50',
                        textColor: 'text-blue-700'
                    },
                    {
                        label: 'Avg Order Value',
                        value: `${RS}${fmt(stats.averageOrderValue)}`,
                        icon: BarChart3,
                        gradient: 'from-purple-500 to-purple-700',
                        bgLight: 'bg-purple-50',
                        textColor: 'text-purple-700'
                    },
                ].map(({ label, value, icon: Icon, gradient, textColor }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                                <p className={`font-heading font-extrabold text-2xl ${textColor}`}>{value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center gap-2">
                {[
                    { key: 'area', label: 'Area' },
                    { key: 'line', label: 'Line' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setChartType(t.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === t.key
                                ? 'bg-primary-900 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Daily Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" /> Daily Revenue
                </h2>
                {daily.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">No paid orders found in this period.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        {chartType === 'area' ? (
                            <AreaChart data={daily}>
                                <defs>
                                    <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#1B5E20" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={2.5}
                                    fill="url(#dailyGrad)" dot={{ fill: '#1B5E20', r: 3 }} activeDot={{ r: 5, fill: '#1B5E20' }} />
                            </AreaChart>
                        ) : (
                            <LineChart data={daily}>
                                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={2.5}
                                    dot={{ fill: '#1B5E20', r: 3 }} activeDot={{ r: 5, fill: '#1B5E20' }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" /> Monthly Revenue
                </h2>
                {monthly.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">No paid orders found in this period.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        {chartType === 'area' ? (
                            <AreaChart data={monthly}>
                                <defs>
                                    <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5}
                                    fill="url(#monthlyGrad)" dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5, fill: '#2563EB' }} />
                            </AreaChart>
                        ) : (
                            <LineChart data={monthly}>
                                <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5}
                                    dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5, fill: '#2563EB' }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
