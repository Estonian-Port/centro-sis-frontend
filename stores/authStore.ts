import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  selectedRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setSelectedRole: (role: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  selectedRole: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => set({ token }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  logout: () => set({ 
    user: null, 
    token: null, 
    selectedRole: null, 
    isAuthenticated: false 
  }),
  setLoading: (loading) => set({ isLoading: loading }),
}));