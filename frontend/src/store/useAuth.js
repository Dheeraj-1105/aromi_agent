import { create } from 'zustand'

/**
 * Zustand auth store — stores the JWT in memory only (not localStorage).
 * This is more secure against XSS than localStorage.
 */
const useAuth = create((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setToken: (token) => set({ token, isAuthenticated: !!token }),

  setUser: (user) => set({ user }),

  login: (token, user) => set({ token, user, isAuthenticated: true }),

  logout: () => set({ token: null, user: null, isAuthenticated: false }),

  getToken: () => get().token,
}))

export default useAuth
