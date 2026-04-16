import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { MENU_ITEMS } from '../config/menuConfig';
import { localUsersSeed, rolesSeed } from '../data/seedData';
import { sha256, supabase } from '../lib/supabase';
import { getUserAccessMap, isRoleAllowed } from '../services/accessService';
import type { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  accessMap: Record<string, boolean>;
  login: (identifier: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
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
    auth_user_id: data.auth_user_id || undefined,
    last_login_at: data.last_login_at || undefined,
    role: data.role || null,
  };
}

async function writeActivity(userId: string, actionType: string, remarks: string) {
  if (!supabase) return;

  await supabase.from('user_activities').insert({
    user_id: userId,
    screen_name: 'Login',
    action_type: actionType,
    remarks,
    device_info: navigator.userAgent,
  });
}

function toInternalEmail(identifier: string, existingEmail?: string | null) {
  const direct = String(existingEmail || '').trim().toLowerCase();
  if (direct) return direct;

  const cleaned = identifier.trim().toLowerCase();
  if (cleaned.includes('@')) return cleaned;
  return `${cleaned}@futureseal.local`;
}

async function resolveAppUser(identifier: string) {
  if (!supabase) return null;

  const cleaned = identifier.trim().toLowerCase();
  let query = supabase.from('app_users').select('*, role:roles(*)').eq('status', 'Active');
  query = cleaned.includes('@') ? query.eq('email', cleaned) : query.eq('username', cleaned);

  const { data } = await query.maybeSingle();
  return data;
}

async function ensureUserEmail(profile: any, identifier: string) {
  if (!supabase || !profile?.id) return toInternalEmail(identifier, profile?.email);

  const derivedEmail = toInternalEmail(identifier, profile?.email);

  if (!profile.email || String(profile.email).trim() === '') {
    await supabase
      .from('app_users')
      .update({
        email: derivedEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
  }

  return derivedEmail;
}

function buildFallbackAppUser(authUser: SupabaseAuthUser): AppUser {
  const email = toInternalEmail(authUser.email || authUser.user_metadata?.username || authUser.id, authUser.email);
  const username = String(authUser.user_metadata?.username || email.split('@')[0] || authUser.id)
    .trim()
    .toLowerCase();

  const seededUser = localUsersSeed.find(
    (item) => item.username === username || String(item.email || '').toLowerCase() === email
  );

  const derivedRole = seededUser?.role || rolesSeed.find((role) => (username.includes('admin') ? role.name === 'Admin' : role.name === 'Design User')) || null;

  return {
    id: seededUser?.id || authUser.id,
    username,
    first_name: seededUser?.first_name || (username.includes('admin') ? 'Admin' : 'Design'),
    last_name: seededUser?.last_name || (username.includes('admin') ? 'Design' : 'User'),
    email,
    status: 'Active',
    role_id: seededUser?.role_id || derivedRole?.id,
    auth_user_id: authUser.id,
    last_login_at: new Date().toISOString(),
    role: derivedRole,
  };
}

async function findLegacyUser(identifier: string, email: string, passwordHash: string) {
  if (!supabase) return null;

  const usernameMatch = await supabase
    .from('app_users')
    .select('*, role:roles(*)')
    .eq('username', identifier)
    .eq('password_hash', passwordHash)
    .eq('status', 'Active')
    .maybeSingle();

  if (usernameMatch.data) {
    return usernameMatch.data;
  }

  if (!email) {
    return null;
  }

  const emailMatch = await supabase
    .from('app_users')
    .select('*, role:roles(*)')
    .eq('email', email)
    .eq('password_hash', passwordHash)
    .eq('status', 'Active')
    .maybeSingle();

  return emailMatch.data || null;
}

async function fetchAppUserByAuthUser(authUser: SupabaseAuthUser, passwordHash?: string): Promise<AppUser | null> {
  if (!supabase) return null;

  const email = toInternalEmail(authUser.email || authUser.user_metadata?.username || authUser.id, authUser.email);
  const username = String(authUser.user_metadata?.username || email.split('@')[0] || authUser.id)
    .trim()
    .toLowerCase();
  const preferredRoleName = username.includes('admin') ? 'Admin' : 'Design User';

  let { data } = await supabase
    .from('app_users')
    .select('*, role:roles(*)')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();

  if (!data) {
    const emailLookup = await supabase
      .from('app_users')
      .select('*, role:roles(*)')
      .eq('email', email)
      .maybeSingle();

    data = emailLookup.data || null;
  }

  const { data: preferredRole } = await supabase
    .from('roles')
    .select('*')
    .eq('name', preferredRoleName)
    .maybeSingle();

  const { data: fallbackRole } = await supabase
    .from('roles')
    .select('*')
    .order('is_admin', { ascending: false })
    .limit(1)
    .maybeSingle();

  const roleRow = preferredRole || fallbackRole;
  if (!roleRow) {
    return null;
  }

  const fullName = String(authUser.user_metadata?.full_name || '').trim();
  const [firstFromFull = '', ...rest] = fullName.split(' ').filter(Boolean);
  const firstName = firstFromFull || (username.includes('admin') ? 'Admin' : username);
  const lastName = rest.join(' ') || (username.includes('admin') ? 'Design' : 'User');
  const safePasswordHash = passwordHash || (await sha256(`jwt:${authUser.id}`));

  try {
    if (data?.id) {
      await supabase
        .from('app_users')
        .update({
          username,
          email,
          auth_user_id: authUser.id,
          role_id: data.role_id || roleRow.id,
          status: data.status || 'Active',
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
    } else {
      await supabase.from('app_users').insert({
        id: authUser.id,
        username,
        password_hash: safePasswordHash,
        first_name: firstName,
        last_name: lastName,
        email,
        role_id: roleRow.id,
        auth_user_id: authUser.id,
        status: 'Active',
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const repairedUser = await supabase
      .from('app_users')
      .select('*, role:roles(*)')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (repairedUser.data?.status === 'Active') {
      return normalizeUser(repairedUser.data);
    }
  } catch {
    return buildFallbackAppUser(authUser);
  }

  return buildFallbackAppUser(authUser);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;

    async function applySession(session: Session | null) {
      if (!active) return;

      if (!supabase) {
        const raw = localStorage.getItem(STORAGE_KEY);
        const cachedUser = raw ? (JSON.parse(raw) as AppUser) : null;
        setUser(cachedUser);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (!session?.user) {
          setUser(null);
          setAccessMap({});
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        const appUser = await fetchAppUserByAuthUser(session.user);
        if (!active) return;

        if (!appUser) {
          await supabase.auth.signOut();
          setUser(null);
          setAccessMap({});
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        setUser(appUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    async function hydrateSession() {
      if (!supabase) {
        await applySession(null);
        return;
      }

      const { data } = await supabase.auth.getSession();
      await applySession(data.session);
    }

    void hydrateSession();

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrateAccess() {
      if (!user) {
        setAccessMap({});
        return;
      }

      setLoading(true);
      try {
        const map = await getUserAccessMap(user);
        if (active) {
          setAccessMap(map);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void hydrateAccess();
    return () => {
      active = false;
    };
  }, [user]);

  const login = useCallback(async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const cleanedIdentifier = identifier.trim().toLowerCase();

      if (!cleanedIdentifier) {
        return 'Enter a username or email.';
      }

      if (!password.trim()) {
        return 'Enter a password.';
      }

      if (!supabase) {
        return 'Supabase is not configured for JWT authentication.';
      }

      const knownProfile = await resolveAppUser(cleanedIdentifier);
      const email = await ensureUserEmail(knownProfile, cleanedIdentifier);

      const passwordHash = await sha256(password);

      let sessionUser: SupabaseAuthUser | null = null;
      const signInResult = await supabase.auth.signInWithPassword({ email, password });

      if (signInResult.data.user) {
        sessionUser = signInResult.data.user;
      } else {
        const legacyProfile = await findLegacyUser(cleanedIdentifier, email, passwordHash);

        if (!legacyProfile?.id) {
          if (/email not confirmed/i.test(signInResult.error?.message || '')) {
            return 'Email confirmation is still pending for this Supabase account.';
          }
          return 'Invalid username/email or password.';
        }

        const legacyEmail = await ensureUserEmail(legacyProfile, cleanedIdentifier);

        const signUpResult = await supabase.auth.signUp({
          email: legacyEmail,
          password,
          options: {
            data: {
              username: legacyProfile.username,
            },
          },
        });

        if (signUpResult.error && /at least 6 characters/i.test(signUpResult.error.message)) {
          return 'This legacy user needs a seeded Supabase Auth account or a password with at least 6 characters.';
        }

        if (signUpResult.error && !/already registered|already been registered/i.test(signUpResult.error.message)) {
          return signUpResult.error.message;
        }

        const retrySignIn = await supabase.auth.signInWithPassword({
          email: legacyEmail,
          password,
        });

        if (retrySignIn.error || !retrySignIn.data.user) {
          if (/email not confirmed/i.test(retrySignIn.error?.message || '')) {
            return 'JWT auth is enabled, but this user must be confirmed in Supabase Auth first.';
          }
          return retrySignIn.error?.message || 'Unable to create the Supabase session.';
        }

        sessionUser = retrySignIn.data.user;
      }

      const appUser = await fetchAppUserByAuthUser(sessionUser, passwordHash);
      const resolvedUser = appUser || buildFallbackAppUser(sessionUser);

      setUser(resolvedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedUser));
      setAccessMap(await getUserAccessMap(resolvedUser));
      await writeActivity(resolvedUser.id, 'Login', 'Supabase JWT login');
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to sign in right now.';
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (user?.id) {
      await writeActivity(user.id, 'Logout', 'Supabase JWT logout');
    }

    if (supabase) {
      await supabase.auth.signOut();
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
    (screenName: string) => {
      const menuItem = MENU_ITEMS.find((item) => item.screenName === screenName);
      return Boolean(user?.role?.is_admin) || Boolean(accessMap[screenName]) || Boolean(menuItem && isRoleAllowed(user, menuItem));
    },
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
