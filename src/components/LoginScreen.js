import React from 'react';
import { getAuthUrl } from '../lib/strava';

export default function LoginScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: '2rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Pacer
        </div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 300,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}>
          Your marathon training,<br />at a glance.
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 300,
        }}>
          Connect your Strava account to get started.
        </p>
      </div>

      <a
        href={getAuthUrl()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--accent)',
          color: '#0c0c0b',
          padding: '12px 24px',
          borderRadius: 'var(--radius)',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.target.style.opacity = '0.85'}
        onMouseLeave={e => e.target.style.opacity = '1'}
      >
        Connect with Strava
      </a>

      <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
        Read-only access to your activities.
      </p>
    </div>
  );
}
