'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Heart, MapPin, Bell, LogOut, ChevronRight, Edit2, Phone, Mail, CheckCircle, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function AccountPage() {
const { user: storeUser, isAuthenticated, logout } = useAuthStore();
const router = useRouter();
const [profile, setProfile] = useState(storeUser || null);
const [profileLoading, setProfileLoading] = useState(!storeUser);
const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0, unread: 0 });
const [editing, setEditing] = useState(false);
const [form, setForm] = useState({ name: storeUser?.name || '', email: storeUser?.email || '' });
  const [saving, setSaving] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);


useEffect(() => {
  if (!isAuthenticated) { router.push('/login'); return; }
  api.get('/user/profile').then((r) => {
    setProfile(r.data.data);
    setForm({ name: r.data.data.name, email: r.data.data.email || '' });
  }).finally(() => setProfileLoading(false));
  Promise.allSettled([
    api.get('/orders'),
    api.get('/user/wishlist'),
    api.get('/user/addresses'),
    api.get('/user/notifications'),
  ]).then(([orders, wishlist, addresses, notifs]) => {
    setStats({
      orders:    orders.status    === 'fulfilled' ? (orders.value.data.data?.length    || 0) : 0,
      wishlist:  wishlist.status  === 'fulfilled' ? (wishlist.value.data.data?.length  || 0) : 0,
      addresses: addresses.status === 'fulfilled' ? (addresses.value.data.data?.length || 0) : 0,
      unread:    notifs.status    === 'fulfilled' ? (notifs.value.data.data?.filter(n => !n.isRead).length || 0) : 0,
    });
  });
}, []);

  const startOtpTimer = () => {
    setOtpTimer(60);
    const t = setInterval(() => {
      setOtpTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    const emailChanged = form.email.trim() !== (profile?.email || '');
    if (emailChanged) {
      if (!form.email.trim()) { toast.error('Email cannot be empty'); return; }
      setOtpSending(true);
      try {
        await api.post('/user/email/send-otp', { newEmail: form.email.trim() });
        setPendingEmail(form.email.trim());
        setOtp(['', '', '', '', '', '']);
        setOtpModal(true);
        startOtpTimer();
        toast.success('OTP sent to ' + form.email.trim());
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send OTP');
      } finally { setOtpSending(false); }
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/user/profile', { name: form.name, email: form.email });
      setProfile(res.data.data);
      useAuthStore.getState().updateUser(res.data.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val.slice(-1); setOtp(n);
    if (val && idx < 5) document.getElementById('eotp-' + (idx + 1))?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) { const n = [...otp]; n[idx] = ''; setOtp(n); }
      else if (idx > 0) document.getElementById('eotp-' + (idx - 1))?.focus();
    }
    if (e.key === 'ArrowLeft'  && idx > 0) document.getElementById('eotp-' + (idx - 1))?.focus();
    if (e.key === 'ArrowRight' && idx < 5) document.getElementById('eotp-' + (idx + 1))?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const n = [...otp];
    text.split('').forEach((d, i) => { if (i < 6) n[i] = d; });
    setOtp(n);
    document.getElementById('eotp-' + Math.min(text.length, 5))?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setOtpVerifying(true);
    try {
      const nameChanged = form.name.trim() !== (profile?.name || '');
      let updated;
      const res = await api.post('/user/email/verify-otp', { newEmail: pendingEmail, otp: code });
      updated = res.data.data;
      if (nameChanged) {
        const profileRes = await api.put('/user/profile', { name: form.name.trim(), email: pendingEmail });
        updated = profileRes.data.data;
      }
      setProfile(updated);
      setForm({ name: updated.name, email: updated.email || '' });
      useAuthStore.getState().updateUser(updated);
      toast.success('Email updated successfully!');
      setOtpModal(false);
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('eotp-0')?.focus();
    } finally { setOtpVerifying(false); }
  };

  const handleResendOtp = async () => {
    setOtpSending(true);
    try {
      await api.post('/user/email/send-otp', { newEmail: pendingEmail });
      setOtp(['', '', '', '', '', '']);
      startOtpTimer();
      toast.success('OTP resent to ' + pendingEmail);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally { setOtpSending(false); }
  };


  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  const menuItems = [
    { icon: Package, label: 'My Orders',      sub: 'Track and manage orders',        href: '/orders',                badge: stats.orders    },
    { icon: Heart,   label: 'My Wishlist',     sub: 'Saved items',                    href: '/account/wishlist',       badge: stats.wishlist  },
    { icon: MapPin,  label: 'My Addresses',    sub: 'Manage delivery addresses',      href: '/account/addresses',      badge: stats.addresses },
    { icon: Bell,    label: 'Notifications',   sub: 'Order updates and alerts',       href: '/account/notifications',  badge: stats.unread, badgeRed: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 pt-6" style={{ maxWidth: 640 }}>

        {/* ?? Profile Card ?? */}
        <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-green-700 rounded-3xl p-6 mb-5 overflow-hidden shadow-large">
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          {profileLoading ? (
            <div className="relative z-10 flex items-start gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-5 w-36 rounded-lg bg-white/20" />
                <div className="h-3.5 w-28 rounded-lg bg-white/15" />
                <div className="h-3.5 w-40 rounded-lg bg-white/15" />
              </div>
            </div>
          ) : (
          <div className="relative z-10 flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-heading font-extrabold text-2xl text-white flex-shrink-0 border border-white/20">
              {initials}
            </div>

            {/* Info / Edit form */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm font-semibold focus:outline-none focus:border-white/60"
                  />
                  <input
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="Email (optional)"
                    type="email"
                    className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 text-sm font-semibold focus:outline-none focus:border-white/60"
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={handleSave} disabled={saving || otpSending}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-primary-900 font-extrabold text-xs disabled:opacity-60 transition-opacity">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {saving || otpSending ? 'Please wait...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/20 text-white font-bold text-xs border border-white/30">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-heading font-extrabold text-xl text-white leading-tight mb-1">{profile?.name}</h2>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                      <Phone className="w-3 h-3" /> {profile?.phone}
                    </div>
                    {profile?.email && (
                      <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                        <Mail className="w-3 h-3" /> {profile.email}
                      </div>
                    )}
                    {memberSince && (
                      <p className="text-white/50 text-[11px] font-semibold mt-1">Member since {memberSince}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {!editing && (
              <button onClick={() => setEditing(true)}
                className="w-9 h-9 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0 hover:bg-white/30 transition-colors">
                <Edit2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          )}

          {/* Stats strip */}
          <div className="relative z-10 grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
            {[
              { label: 'Orders',    value: stats.orders    },
              { label: 'Wishlist',  value: stats.wishlist  },
              { label: 'Addresses', value: stats.addresses },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-heading font-extrabold text-xl text-white">{s.value}</p>
                <p className="text-white/60 text-[11px] font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ?? Menu ?? */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden mb-4">
          {menuItems.map(({ icon: Icon, label, sub, href, badge, badgeRed }, i) => (
            <Link key={href} href={href} className="block group">
              <div className={`flex items-center gap-4 px-5 py-4 group-hover:bg-gray-50 transition-colors ${i < menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-5 h-5 text-primary-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 font-semibold">{sub}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {badge > 0 && (
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${badgeRed ? 'bg-red-100 text-red-600' : 'bg-primary-50 text-primary-900'}`}>
                      {badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-900 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ?? Logout ?? */}
        <button onClick={handleLogout}
          className="w-full py-4 rounded-2xl border-2 border-red-100 bg-white flex items-center justify-center gap-3 text-red-600 font-extrabold text-sm hover:bg-red-50 hover:border-red-200 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* ?? Email OTP Modal ?? */}
      {otpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-900" />
                <h3 className="font-heading font-extrabold text-base text-gray-900">Verify New Email</h3>
              </div>
              <button onClick={() => setOtpModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-col items-center gap-2 mb-5">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary-900" />
                </div>
                <p className="text-sm text-gray-500 text-center">OTP sent to</p>
                <p className="font-bold text-gray-900 text-sm">{pendingEmail}</p>
              </div>
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Enter 6-digit OTP</label>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={'eotp-' + idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => handleOtpKey(e, idx)}
                    style={{ height: '3.25rem' }}
                    className={'w-10 text-center text-xl font-extrabold rounded-xl border-2 transition-all focus:outline-none ' + (
                      digit ? 'border-primary-900 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white text-gray-900 focus:border-primary-900'
                    )}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 font-medium mt-2">Tip: You can paste the OTP directly</p>
              <button
                onClick={handleVerifyOtp}
                disabled={otpVerifying || otp.join('').length !== 6}
                className="w-full mt-5 py-3.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all">
                {otpVerifying
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                  : <><CheckCircle className="w-4 h-4" /> Verify &amp; Update Email</>}
              </button>
              <div className="flex items-center justify-between mt-4 text-sm">
                <button onClick={() => setOtpModal(false)} className="text-gray-500 font-semibold hover:text-gray-700 transition-colors">
                  &larr; Cancel
                </button>
                {otpTimer > 0
                  ? <span className="text-gray-400 font-semibold">Resend in {otpTimer}s</span>
                  : <button onClick={handleResendOtp} disabled={otpSending} className="text-primary-900 font-bold hover:underline disabled:opacity-50">
                      {otpSending ? 'Sending...' : 'Resend OTP'}
                    </button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}