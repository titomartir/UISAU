import { create } from 'zustand';

const STORAGE_KEY = 'uisau_auth';

const loadAuth = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { accessToken: null, refreshToken: null, user: null };
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
};

const persistAuth = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user
    })
  );
};

export const useAuthStore = create((set, get) => ({
  ...loadAuth(),
  isAuthenticated: !!loadAuth().accessToken,

  setAuth: ({ accessToken, refreshToken, user }) => {
    set({ accessToken, refreshToken, user, isAuthenticated: true });
    persistAuth(get());
  },

  clearAuth: () => {
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
    localStorage.removeItem(STORAGE_KEY);
  }
}));
