'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminLayoutWrapper({ children }) {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return; // wait until store loads
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      // not authorized
      router.replace('/');
    }
  }, [isAuthenticated, isHydrated, user]);

  // while checking show nothing or a loader
  if (!isHydrated || !isAuthenticated || (user && user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
