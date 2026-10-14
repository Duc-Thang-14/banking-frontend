import { create } from 'zustand';
import { apiClient } from '../api/client';
import type { AuthResponse, WalletResponse } from '../types';

interface AuthState {
  token: string | null;
  username: string | null;
  walletNumber: string | null;
  wallet: WalletResponse | null;
  isLoading: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
  fetchWallet: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('access_token'),
  username: localStorage.getItem('username'),
  walletNumber: localStorage.getItem('wallet_number'),
  wallet: null,
  isLoading: false,

  setAuth: (data: AuthResponse) => {
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('username', data.username);
    localStorage.setItem('wallet_number', data.defaultWalletNumber);
    set({
      token: data.accessToken,
      username: data.username,
      walletNumber: data.defaultWalletNumber,
    });
    get().fetchWallet();
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('wallet_number');
    set({
      token: null,
      username: null,
      walletNumber: null,
      wallet: null,
    });
  },

  fetchWallet: async () => {
    const { walletNumber, token } = get();
    if (!walletNumber || !token) return;

    set({ isLoading: true });
    try {
      const response = await apiClient.get<WalletResponse>(`/wallets/${walletNumber}`);
      set({ wallet: response.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
