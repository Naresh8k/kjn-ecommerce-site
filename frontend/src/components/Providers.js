'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';

export default function Providers({ children }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
  });
  const { setAuth, logout, setHydrated, isHydrated } = useAuthStore();

  useEffect(() => {
    // Generate session ID for guest cart
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', 'sess_' + Math.random().toString(36).slice(2));
    }

    // Initialize auth state from localStorage and refresh token if needed
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            // Token exists, validate it
            const res = await api.get('/auth/me');
            if (res.data.user) {
              setAuth(res.data.user, token);
              return;
            }
          } catch (err) {
            if (err.response?.status === 401) {
              // Token expired, try to refresh
              try {
                const refreshRes = await api.post('/auth/refresh', {});
                if (refreshRes.data.accessToken) {
                  const userRes = await api.get('/auth/me');
                  setAuth(userRes.data.user, refreshRes.data.accessToken);
                  // Merge guest session cart into user cart (if present)
                  try {
                    const sessionId = localStorage.getItem('sessionId');
                    if (sessionId) await api.post('/cart/merge', { sessionId });
                    // refresh cart state
                    useCartStore.getState().fetchCart();
                  } catch (e) { /* non‑fatal */ }
                  return;
                }
              } catch (refreshErr) {
                logout();
                return;
              }
            } else {
              logout();
              return;
            }
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setHydrated(true);
      }
    };

    initAuth();
  }, [setAuth, logout, setHydrated]);

  // Don't render anything until hydration is complete to prevent flash of login screen
  if (!isHydrated) {
    return null;
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}