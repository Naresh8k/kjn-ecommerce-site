'use client';
import { useEffect, useState } from 'react';
import { 
  Package, ShoppingBag, Users, TrendingUp, 
  TrendingDown, AlertCircle, Clock, DollarSign 
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => {
        setStats(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!stats) return <p className="text-gray-600">Failed to load dashboard data</p>;

  const statCards = [
    {
      title: 'Pending Orders',
      value: stats.orders?.pending || 0,
      trend: '+12%',
      trendUp: false,
      icon: Clock,
      iconBg: 'from-amber-100 to-amber-200',
      iconColor: 'text-amber-600',
      description: 'Awaiting processing'
    },
    {
      title: 'Total Orders',
      value: stats.orders?.total || 0,
      trend: '+23%',
      trendUp: true,
      icon: ShoppingBag,
      iconBg: 'from-primary-100 to-primary-200',
      iconColor: 'text-primary-900',
      description: 'All time orders'
    },
    {
      title: 'Total Products',
      value: stats.products?.total || 0,
      trend: '+8%',
      trendUp: true,
      icon: Package,
      iconBg: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      description: 'Active products'
    },
    {
      title: 'Low Stock Items',
      value: stats.products?.lowStock || 0,
      trend: '-5%',
      trendUp: false,
      icon: AlertCircle,
      iconBg: 'from-red-100 to-red-200',
      iconColor: 'text-red-600',
      description: 'Need restocking'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-3xl text-gray-900 mb-2">
          Welcome back, Admin ??
        </h1>
        <p className="text-base text-gray-600">
          Here's what's happening with your store today
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>

              {/* Trend Badge */}
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                card.trendUp 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {card.trendUp ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs font-bold ${
                  card.trendUp ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {card.trend}
                </span>
              </div>
            </div>

            {/* Title */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {card.title}
            </p>

            {/* Value */}
            <h3 className="font-heading font-extrabold text-4xl text-gray-900 mb-1">
              {card.value.toLocaleString()}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', href: '/admin/products', icon: Package, color: 'primary' },
            { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag, color: 'blue' },
            { label: 'Manage Users', href: '/admin/customers', icon: Users, color: 'purple' },
            { label: 'Analytics', href: '/admin/revenue', icon: DollarSign, color: 'amber' }
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="group flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-primary hover:border-primary hover:translate-x-1 transition-all duration-200"
            >
              <action.icon className={`w-5 h-5 text-${action.color}-600 group-hover:text-white transition-colors`} />
              <span className="font-semibold text-sm text-gray-700 group-hover:text-white transition-colors">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
