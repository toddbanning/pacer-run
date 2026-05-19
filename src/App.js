import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import AuthCallback from './components/AuthCallback';
import LoginScreen from './components/LoginScreen';
import { getTokens } from './lib/strava';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const tokens = getTokens();
    setIsAuthenticated(!!tokens);
    setChecking(false);
  }, []);

  if (checking) return null;

  // Handle OAuth callback
  const path = window.location.pathname;
  if (path === '/callback') {
    return <AuthCallback onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
}
