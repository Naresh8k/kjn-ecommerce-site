import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true, isHydrated: true });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false, isHydrated: true });
      },

      updateUser: (user) => set({ user }),

      setHydrated: (isHydrated) => set({ isHydrated }),
    }),
    // Persist both user and accessToken
    { name: 'kjn-auth', partialize: (state) => ({ user: state.user, accessToken: state.accessToken }) }
  )
);


export default useAuthStore;