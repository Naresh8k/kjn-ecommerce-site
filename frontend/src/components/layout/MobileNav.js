'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Heart, User, Menu } from 'lucide-react';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

export default function MobileNav() {
  const pathname = usePathname();
  const { cart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const cartCount = cart?.totalItems || 0;

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/categories', icon: Grid, label: 'Categories' },
    { href: '/menu', icon: Menu, label: 'More' },
    { href: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
    { href: isAuthenticated ? '/account' : '/login', icon: User, label: isAuthenticated ? 'Account' : 'Login' },
  ];

  return (
    <nav className="mobile-nav">
      {links.map(({ href, icon: Icon, label, badge }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '8px 4px', gap: 3,
            color: active ? '#1B5E20' : '#9CA3AF',
            position: 'relative', fontSize: 10, fontWeight: 700,
            transition: 'all 0.2s',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon style={{ width: 22, height: 22 }} strokeWidth={active ? 2.5 : 1.8} />
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#FF6F00', color: 'white',
                  width: 16, height: 16, borderRadius: '50%',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{badge > 9 ? '9+' : badge}</span>
              )}
            </div>
            <span>{label}</span>
            {active && (
              <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 3, background: '#1B5E20', borderRadius: '3px 3px 0 0' }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}