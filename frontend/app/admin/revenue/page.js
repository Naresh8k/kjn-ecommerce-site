'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

export default function RevenuePage() {
    const [daily, setDaily] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRevenue();
    }, []);

    const loadRevenue = async () => {
        try {
            // Fetch last 12 months of data
            const fromDate = new Date();
            fromDate.setFullYear(fromDate.getFullYear() - 1);
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-heading font-extrabold text-3xl text-gray-900 mb-1">
                    Revenue Analytics
                </h1>
                <p className="text-sm text-gray-500">Track your store&apos;s financial performance (last 12 months)</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Revenue', value: `${RS}${fmt(stats.totalRevenue)}`, cls: 'text-green-700' },
                    { label: 'Total Orders', value: stats.totalOrders, cls: 'text-blue-700' },
                    { label: 'Avg Order Value', value: `${RS}${fmt(stats.averageOrderValue)}`, cls: 'text-purple-700' },
                ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                        <p className={`font-heading font-extrabold text-2xl ${cls}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Daily Revenue */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Daily Revenue</h2>
                {daily.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">No paid orders found in the last 12 months.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={daily}>
                            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                                formatter={(value) => [`${RS}${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={3}
                                dot={{ fill: '#1B5E20', r: 4 }} activeDot={{ r: 6, fill: '#1B5E20' }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Monthly Revenue</h2>
                {monthly.length === 0 ? (
                    <p className="text-gray-400 text-sm py-8 text-center">No paid orders found in the last 12 months.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthly}>
                            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                                formatter={(value) => [`${RS}${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3}
                                dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6, fill: '#2563EB' }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
