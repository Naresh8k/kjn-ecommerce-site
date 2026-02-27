'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Bell, LogOut, ChevronRight, Edit2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/user/profile').then((r) => {
      setProfile(r.data.data);
      setForm({ name: r.data.data.name, email: r.data.data.email || '' });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/user/profile', form);
      setProfile(res.data.data);
      useAuthStore.getState().updateUser(res.data.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', sub: 'Track and manage orders', href: '/orders' },
    { icon: Heart, label: 'My Wishlist', sub: 'Saved items', href: '/account/wishlist' },
    { icon: MapPin, label: 'My Addresses', sub: 'Manage delivery addresses', href: '/account/addresses' },
    { icon: Bell, label: 'Notifications', sub: 'Order updates and alerts', href: '/account/notifications' },
  ];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        {/* Profile Header */}
        <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', borderRadius: 20, padding: '28px 24px', marginBottom: 20, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, fontFamily: 'Sora', flexShrink: 0 }}>
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '8px 12px' }}
                    placeholder="Your name" />
                  <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '8px 12px' }}
                    placeholder="Email (optional)" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleSave} disabled={saving}
                      style={{ padding: '6px 16px', borderRadius: 8, background: 'white', color: '#1B5E20', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)}
                      style={{ padding: '6px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, color: 'white', marginBottom: 4 }}>{profile?.name}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.85 }}>
                      <Phone style={{ width: 13 }} /> {profile?.phone}
                    </div>
                    {profile?.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: 0.85 }}>
                        <Mail style={{ width: 13 }} /> {profile?.email}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Edit2 style={{ width: 16, color: 'white' }} />
              </button>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          {menuItems.map(({ icon: Icon, label, sub, href }, i) => (
            <Link key={href} href={href}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < menuItems.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 20, color: '#1B5E20' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</p>
                </div>
                <ChevronRight style={{ width: 18, color: '#9CA3AF' }} />
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{ width: '100%', padding: '16px', borderRadius: 14, border: '2px solid #FEE2E2', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#DC2626', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'}
          onMouseOut={e => e.currentTarget.style.background = 'white'}>
          <LogOut style={{ width: 18 }} /> Sign Out
        </button>
      </div>
    </div>
  );
}