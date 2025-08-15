import React, { createContext, useContext, useEffect, useState } from 'react';
import { Hub } from 'aws-amplify/utils';
import authService from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      switch (event) {
        case 'signedIn':
        case 'signInWithRedirect':
          checkAuthState();
          break;
        case 'signedOut':
          setUser(null);
          setIsAuthenticated(false);
          break;
        case 'signInWithRedirect_failure':
          setLoading(false);
          break;
      }
    });
    return unsubscribe;
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    const result = await authService.signUpWithCognito(email, password, fullName);
    if (result.success) return result;
    throw new Error(result.error);
  };

  const signIn = async (email, password) => {
    const result = await authService.signInWithCognito(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
      return result;
    }
    throw new Error(result.error);
  };

  const verifyEmail = async (email, code) => {
    const result = await authService.verifyEmailWithCognito(email, code);
    if (result.success) return result;
    throw new Error(result.error);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    return await authService.signInWithGoogle();
  };

  const signOut = async () => {
    const result = await authService.signOut();
    if (result.success) {
      setUser(null);
      setIsAuthenticated(false);
    }
    return result;
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading,
      signUp, signIn, verifyEmail, signInWithGoogle, signOut,
      resendCode: authService.resendVerificationCode,
      getUserId: authService.getUserId,
      checkAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
};
