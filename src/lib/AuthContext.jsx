import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/api/client';
import { appParams } from '@/lib/app-params';
import { clearToken, getToken, hasToken } from '@/lib/auth-token';

/** @type {import('react').Context<null | Record<string, unknown>>} */
const AuthContext = createContext(null);

async function fetchPublicSettings(appId) {
  const headers = { 'X-App-Id': appId };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/apps/public/prod/public-settings/by-id/${appId}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    /** @type {Error & { status?: number; data?: unknown }} */
    const err = new Error(data.message || 'Failed to load app');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('User auth check failed:', error);
      if (error.status === 401) {
        clearToken();
      }
      setUser(null);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      try {
        const publicSettings = await fetchPublicSettings(appParams.appId);
        setAppPublicSettings(publicSettings);

        const authRequired = publicSettings?.public_settings?.auth_required !== false;

        if (hasToken()) {
          await checkUserAuth();
        } else if (authRequired) {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError({ type: 'auth_required', message: 'Authentication required' });
          setIsLoadingAuth(false);
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
      } catch (appError) {
        console.error('App state check failed:', appError);

        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app',
            });
          } else {
            setAuthError({ type: reason, message: appError.message });
          }
        } else {
          setAuthError({ type: 'unknown', message: appError.message || 'Failed to load app' });
        }
        setIsLoadingAuth(false);
      } finally {
        setIsLoadingPublicSettings(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({ type: 'unknown', message: error.message || 'Auth failed' });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const refreshAuth = async () => {
    setAuthError(null);
    await checkUserAuth();
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    api.auth.logout(shouldRedirect);
  };

  const navigateToLogin = () => {
    api.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
        refreshAuth,
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
