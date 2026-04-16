import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { localUsersSeed } from '../data/seedData';
import { sha256, supabase } from '../lib/supabase';
import { getUserAccessMap } from '../services/accessService';
import type { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  accessMap: Record<string, boolean>;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
  isAdmin: () => boolean;
  hasRole: (...roles: string[]) => boolean;
  canAccess: (screenName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = 'seal_design_user';

function normalizeUser(data: any): AppUser {
  return {
    id: String(data.id),
    username: String(data.username || '').toLowerCase(),
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
    status: data.status || 'Active',
    role_id: data.role_id,
    role: data.role || null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getUserAccessMap(user).then(setAccessMap);
  }, [user]);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const cleanedUsername = username.trim().toLowerCase();
      const hash = await sha256(password);

      if (supabase) {
        const { data } = await supabase
          .from('app_users')
          .select('*, role:roles(*)')
          .eq('username', cleanedUsername)
          .eq('password_hash', hash)
          .eq('status', 'Active')
          .single();

        if (data) {
          const appUser = normalizeUser(data);
          setUser(appUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));

          await supabase.from('user_activities').insert({
            user_id: appUser.id,
            screen_name: 'Login',
            action_type: 'Login',
            remarks: 'Seal design web login',
            device_info: navigator.userAgent,
          });

          return null;
        }
      }

      const localUser = localUsersSeed.find(
        (item) =>
          item.username === cleanedUsername &&
          item.password_hash === hash &&
          item.status === 'Active'
      );

      if (!localUser) {
        return 'Invalid username or password.';
      }

      const safeUser = normalizeUser(localUser);
      setUser(safeUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
      return null;
    } catch {
      return 'Unable to sign in right now.';
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (supabase && user?.id) {
      supabase.from('user_activities').insert({
        user_id: user.id,
        screen_name: 'Login',
        action_type: 'Logout',
        remarks: 'Seal design web logout',
      });
    }

    setUser(null);
    setAccessMap({});
    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const isAdmin = useCallback(() => Boolean(user?.role?.is_admin), [user]);
  const hasRole = useCallback(
    (...roles: string[]) => {
      const current = (user?.role?.name || '').toLowerCase();
      return roles.some((role) => role.toLowerCase() === current);
    },
    [user]
  );

  const canAccess = useCallback(
    (screenName: string) => Boolean(user?.role?.is_admin) || Boolean(accessMap[screenName]),
    [accessMap, user]
  );

  const value = useMemo(
    () => ({ user, loading, accessMap, login, logout, isAdmin, hasRole, canAccess }),
    [user, loading, accessMap, login, logout, isAdmin, hasRole, canAccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
