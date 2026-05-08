import {authResponse} from "@/services/auth/auth.Interface";
import { persist } from 'zustand/middleware';
import { create } from 'zustand';

interface AuthState {
    user: authResponse | null;
    isAuthenticated: boolean;
    setUser: (user: authResponse) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setUser: (user: authResponse) => set({ user, isAuthenticated: true }),
            clearUser: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);