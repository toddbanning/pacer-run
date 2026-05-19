import React, { useEffect, useState } from 'react';
import { exchangeCodeForTokens, saveTokens } from '../lib/strava';

export default function AuthCallback({ onSuccess }) {
  const [status, setStatus] = useState('Connecting to Strava...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Strava authorization was denied.');
      return;
    }
    if (!code) {
      setError('No authorization code received.');
      return;
    }

    exchangeCodeForTokens(code)
      .then(tokens => {
        saveTokens(tokens);
        setStatus('Connected! Loading your dashboard...');
        window.history.replaceState({}, '', '/');
        setTimeout(onSuccess, 800);
      })
      .catch(e => setError(e.message));
  }, [onSuccess]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {error ? (
        <>
          <p style={{ color: 'var(--red)', fontSize: '14px' }}>{error}</p>
          <a href="/" style={{ color: 'var(--accent)', fontSize: '13px' }}>← Back to login</a>
        </>
      ) : (
        <>
          <div style={{
            width: '32px', height: '32px',
            border: '2px solid var(--border-light)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{status}</p>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
