import React from 'react';
import { useStravaData, useSheetsData } from '../hooks/useData';
import { clearTokens } from '../lib/strava';
import HeaderStats from './HeaderStats';
import WeeklyMileageChart from './WeeklyMileageChart';
import RaceCountdowns from './RaceCountdowns';
import RecentActivities from './RecentActivities';
import WeekPlan from './WeekPlan';
import ShoeHealth from './ShoeHealth';

function Skeleton({ height = 200 }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      height,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)',
        animation: 'shimmer 1.5s infinite',
      }} />
      <style>{`@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const { activities, loading: stravaLoading } = useStravaData(120);
  const { plan, races, shoes, settings, loading: sheetsLoading } = useSheetsData();
  const isLoading = stravaLoading || sheetsLoading;

  const handleLogout = () => { clearTokens(); onLogout(); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav bar */}
      <HeaderStats
        activities={activities}
        plan={plan}
        races={races}
        settings={settings}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Row 1: Chart + Race */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '16px',
          marginBottom: '16px',
        }}>
          {isLoading ? <Skeleton height={280} /> : <WeeklyMileageChart activities={activities} plan={plan} />}
          {isLoading ? <Skeleton height={280} /> : <RaceCountdowns races={races} />}
        </div>

        {/* Row 2: Rolling plan carousel */}
        <div style={{ marginBottom: '16px' }}>
          {isLoading ? <Skeleton height={148} /> : <WeekPlan plan={plan} activities={activities} />}
        </div>

        {/* Row 3: Recent activities */}
        <div style={{ marginBottom: '16px' }}>
          {isLoading ? <Skeleton height={320} /> : <RecentActivities activities={activities} plan={plan} />}
        </div>

        {/* Row 4: Shoe fleet */}
        {isLoading ? <Skeleton height={240} /> : <ShoeHealth shoes={shoes} activities={activities} />}

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
    </div>
  );
}
