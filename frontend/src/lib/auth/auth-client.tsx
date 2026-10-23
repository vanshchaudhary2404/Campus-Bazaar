/**
 * Local JWT auth client for the MERN conversion.
 *
 * This replaces the old BetterAuth setup with a simple fetch-based auth flow that
 * talks to the Express backend running on port 5000.
 */

import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

const API_BASE = '/api';
const TOKEN_KEY = 'campus-bazaar-token';
const USER_KEY = 'campus-bazaar-user';

function readStoredSession() {
  if (typeof window === 'undefined') {
    return { token: '', user: null as AuthUser | null };
  }

  const token = window.localStorage.getItem(TOKEN_KEY) ?? '';
  const user = window.localStorage.getItem(USER_KEY);

  return {
    token,
    user: user ? (JSON.parse(user) as AuthUser) : null,
  };
}

function persistSession(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('campus-bazaar-auth-change'));
}

function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event('campus-bazaar-auth-change'));
}

async function callAuth(endpoint: string, payload: Record<string, string>) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      error: { message: data.message ?? 'Authentication failed' },
    };
  }

  const authData = data as AuthResponse;
  if (authData.token && authData.user) {
    persistSession(authData.token, authData.user);
  }

  return { data: authData };
}

export const authClient = {
  signIn: {
    email: async ({ email, password }: { email: string; password: string }) =>
      callAuth('/auth/login', { email, password }),
  },
  signUp: {
    email: async ({ name, email, password }: { name: string; email: string; password: string }) =>
      callAuth('/auth/register', { name, email, password }),
  },
  signOut: async () => {
    clearSession();
    return { success: true };
  },
  useSession: () => {
    const [session, setSession] = useState(() => readStoredSession());

    useEffect(() => {
      const update = () => setSession(readStoredSession());
      update();
      window.addEventListener('campus-bazaar-auth-change', update);
      return () => window.removeEventListener('campus-bazaar-auth-change', update);
    }, []);

    const data = session.token ? { user: session.user } : null;

    return {
      data,
      isPending: false,
      error: null,
    };
  },
};

export const signIn = authClient.signIn.email;
export const signUp = authClient.signUp.email;
export const signOut = authClient.signOut;

export function useSession() {
  const { data, isPending, error } = authClient.useSession();
  return {
    session: data,
    user: data?.user ?? null,
    isPending,
    error,
    isAuthenticated: !isPending && !!data?.user,
  };
}

export const useAuth = useSession;

export function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const AuthProvider = SessionProvider;

const SESSION_TIMEOUT_MS = 30000;

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isPending } = useSession();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isPending) return;

    const timeout = setTimeout(() => setTimedOut(true), SESSION_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isPending]);

  if (timedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Session check timed out. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function LogoutButton({
  className = '',
  children = 'Logout',
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className || 'px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50'}
    >
      {isLoading ? 'Logging out...' : children}
    </button>
  );
}
