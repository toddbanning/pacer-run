import React from 'react';
import { useStravaData } from '../hooks/useData';
import { useSheetsData } from '../hooks/useData';
import { clearTokens } from '../lib/strava';
import HeaderStats from './HeaderStats';
import WeeklyMileageChart from './WeeklyMileageChart';
import RaceCountdowns from './RaceCountdowns';
import RecentActivities from './RecentActivities';
import WeekPlan from './WeekPlan';
import ShoeHealth from './ShoeHealth';

function LoadingPulse({ label }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
        Loading {label}...
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const { activities, loading: stravaLoading } = useStravaData(120);
  const { plan, races, shoes, settings, loading: sheetsLoading } = useSheetsData();

  const handleLogout = () => {
    clearTokens();
    onLogout();
  };

  const isLoading = stravaLoading || sheetsLoading;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>

      {/* Header */}
      <HeaderStats
        activities={activities}
        plan={plan}
        races={races}
        settings={settings}
        onLogout={handleLogout}
      />

      {/* Row 1: Mileage Chart + Race Countdowns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '16px',
        marginBottom: '16px',
      }}>
        {isLoading
          ? <LoadingPulse label="mileage chart" />
          : <WeeklyMileageChart activities={activities} plan={plan} />
        }
        {isLoading
          ? <LoadingPulse label="races" />
          : <RaceCountdowns races={races} />
        }
      </div>

      {/* Row 2: This Week's Plan */}
      {isLoading
        ? <div style={{ marginBottom: '16px' }}><LoadingPulse label="training plan" /></div>
        : <div style={{ marginBottom: '16px' }}><WeekPlan plan={plan} activities={activities} /></div>
      }

      {/* Row 3: Recent Activities */}
      {isLoading
        ? <div style={{ marginBottom: '16px' }}><LoadingPulse label="activities" /></div>
        : <div style={{ marginBottom: '16px' }}><RecentActivities activities={activities} plan={plan} /></div>
      }

      {/* Row 4: Shoe Health */}
      {isLoading
        ? <LoadingPulse label="shoes" />
        : <ShoeHealth shoes={shoes} activities={activities} />
      }

      {/* Footer */}
      <div style={{
        marginTop: '32px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          pacer · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {activities.length} activities loaded
        </span>
      </div>
    </div>
  );
}
