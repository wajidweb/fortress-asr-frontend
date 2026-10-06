import { create } from 'zustand';

export interface ClientProfile {
  id?: string;
  userId?: string;
  companyName?: string;
  billingAddress?: string;
  urlSlug?: string;
  slug?: string;
  logoUrl?: string | null;
  billingRateHour?: number | string;
  contactPerson?: string | null;
  contactPhone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuardProfile {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  siaLicenceNumber?: string | null;
  siaExpiryDate?: string | null;
  rtwDocumentType?: string | null;
  rtwDocumentUrl?: string | null;
  rightToWorkExpiryDate?: string | null;
  hasIndefiniteRTW?: boolean;
  status?: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'SUPER_ADMIN' | 'SUPERVISOR' | 'GUARD' | 'CLIENT';
  guardProfile?: GuardProfile;
  clientProfile?: ClientProfile;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Helper to safely load initial state on browser mount
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }
  try {
    const token = localStorage.getItem('fortress_auth_token');
    const userStr = localStorage.getItem('fortress_user');
    if (token && userStr) {
      return {
        token,
        user: JSON.parse(userStr) as User,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    // Fail-safe
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fortress_auth_token', token);
      localStorage.setItem('fortress_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fortress_auth_token');
      localStorage.removeItem('fortress_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (partialUser) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...partialUser } : null;
      if (typeof window !== 'undefined' && updatedUser) {
        localStorage.setItem('fortress_user', JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    }),
}));
