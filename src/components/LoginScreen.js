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
          letterSpacing: '0.25em',
          color: 'var(--navy)',
          textTransform: 'uppercase',
          marginBottom: '16px',
          fontWeight: 500,
        }}>
          Pacer
        </div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 300,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '10px',
          lineHeight: 1.2,
        }}>
          Your marathon training,<br />at a glance.
        </h1>
        <p style={{
          color: 'var(--text-tertiary)',
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
          background: 'var(--navy)',
          color: '#FFFFFF',
          padding: '12px 28px',
          borderRadius: 'var(--radius)',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'background 0.15s',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}
      >
        Connect with Strava
      </a>

      <p style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
        Read-only access to your activities.
      </p>
    </div>
  );
}
