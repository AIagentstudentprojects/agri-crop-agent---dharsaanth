import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, SoilType, UserRole } from '../types';

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'demo-farmer-1',
    name: 'Ramesh Patel',
    email: 'ramesh.farmer@kisan.in',
    phone: '+91 98765 43210',
    role: 'Farmer / Landowner',
    avatar: '👨‍🌾',
    farmLocation: 'Ludhiana, Punjab, India',
    latitude: 30.901,
    longitude: 75.8573,
    soilType: 'Loamy',
    landArea: 6,
    areaUnit: 'acres',
    primaryCrop: 'Paddy (Rice)',
    season: 'Kharif (Monsoon)',
    joinedDate: '2023-04-15',
  },
  {
    id: 'demo-farmer-2',
    name: 'Kavitha Murugan',
    email: 'kavitha.agri@tnfarm.org',
    phone: '+91 94432 10987',
    role: 'Smallholder Farmer',
    avatar: '👩‍🌾',
    farmLocation: 'Coimbatore, Tamil Nadu, India',
    latitude: 11.0168,
    longitude: 76.9558,
    soilType: 'Sandy Loam',
    landArea: 3.5,
    areaUnit: 'acres',
    primaryCrop: 'Banana',
    season: 'Perennial',
    joinedDate: '2023-08-20',
  },
  {
    id: 'demo-farmer-3',
    name: 'Sukhwinder Singh',
    email: 'sukhwinder.singh@punjabkisan.in',
    phone: '+91 98140 12345',
    role: 'Commercial Grower',
    avatar: '🚜',
    farmLocation: 'Amritsar, Punjab, India',
    latitude: 31.634,
    longitude: 74.8723,
    soilType: 'Clay',
    landArea: 14,
    areaUnit: 'acres',
    primaryCrop: 'Wheat',
    season: 'Rabi (Winter)',
    joinedDate: '2022-11-10',
  },
  {
    id: 'demo-agronomist-1',
    name: 'Dr. Anita Deshmukh',
    email: 'anita.deshmukh@icar.gov.in',
    phone: '+91 97654 32100',
    role: 'Agronomist / Officer',
    avatar: '🔬',
    farmLocation: 'Nashik, Maharashtra, India',
    latitude: 19.9975,
    longitude: 73.7898,
    soilType: 'Clay Loam',
    landArea: 25,
    areaUnit: 'acres',
    primaryCrop: 'Cotton',
    season: 'Kharif (Monsoon)',
    joinedDate: '2021-06-01',
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  demoAccounts: AuthUser[];
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginAsDemo: (demoId: string) => void;
  loginWithCredentials: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (formData: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    farmLocation: string;
    soilType: SoilType;
    landArea: number;
    primaryCrop: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (updates: Partial<AuthUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'agri_crop_advisor_mock_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse cached auth user:', e);
    }
    // Default to the first demo farmer so the user immediately experiences authenticated features
    return DEMO_USERS[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save auth state to localStorage:', e);
    }
  }, [user]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginAsDemo = (demoId: string) => {
    const found = DEMO_USERS.find((u) => u.id === demoId);
    if (found) {
      setUser(found);
      setIsAuthModalOpen(false);
    }
  };

  const loginWithCredentials = async (
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; message?: string }> => {
    // Mock authentication: check against demo users or accept valid format
    if (!identifier || !pass) {
      return { success: false, message: 'Please provide both email/phone and password.' };
    }

    // Check if matches any demo user by email or name
    const existing = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (u.phone && u.phone.includes(identifier))
    );

    if (existing) {
      setUser(existing);
      setIsAuthModalOpen(false);
      return { success: true };
    }

    // Otherwise create session for this user identifier
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: identifier.includes('@') ? identifier.split('@')[0] : 'Farm Operator',
      email: identifier.includes('@') ? identifier : `${identifier}@agriadvisor.local`,
      phone: identifier.includes('@') ? undefined : identifier,
      role: 'Farmer / Landowner',
      avatar: '🌾',
      farmLocation: 'Punjab, India',
      latitude: 31.1471,
      longitude: 75.3412,
      soilType: 'Loamy',
      landArea: 5,
      areaUnit: 'acres',
      primaryCrop: 'Paddy (Rice)',
      season: 'Kharif (Monsoon)',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const registerUser = async (formData: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    farmLocation: string;
    soilType: SoilType;
    landArea: number;
    primaryCrop: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return { success: false, message: 'Name and email are required.' };
    }

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone?.trim(),
      role: formData.role,
      avatar: formData.role.includes('Agronomist') ? '🔬' : '👨‍🌾',
      farmLocation: formData.farmLocation || 'Coimbatore, Tamil Nadu, India',
      latitude: 11.0168,
      longitude: 76.9558,
      soilType: formData.soilType || 'Loamy',
      landArea: Number(formData.landArea) || 5,
      areaUnit: 'acres',
      primaryCrop: formData.primaryCrop || 'Paddy (Rice)',
      season: 'Kharif (Monsoon)',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const updateUserProfile = (updates: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        demoAccounts: DEMO_USERS,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginAsDemo,
        loginWithCredentials,
        registerUser,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
