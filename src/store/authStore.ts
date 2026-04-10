import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type User, type UserRole, users } from '../data/users'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (role: UserRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (role: UserRole) => {
        const user = users.find((u) => u.role === role)
        if (user) {
          set({ user, isAuthenticated: true })
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'careportal-auth' }
  )
)
