import React from 'react';
import { useStravaData, useSheetsData } from '../hooks/useData';
import { useAthlete } from '../hooks/useAthlete';
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
  const { activities, gearMap, loading: stravaLoading } = useStravaData(120);
  const { plan, races, shoes, settings, loading: sheetsLoading } = useSheetsData();
  const { athlete } = useAthlete();
  const isLoading = stravaLoading || sheetsLoading;
  const handleLogout = () => { clearTokens(); onLogout(); };
  const athleteName = athlete ? `${athlete.firstname || ''} ${athlete.lastname || ''}`.trim() : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <HeaderStats
        activities={activities}
        plan={plan}
        races={races}
        settings={settings}
        athleteName={athleteName}
        onLogout={handleLogout}
      />

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Row 1: Chart + Race */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '16px' }}>
          {isLoading ? <Skeleton height={300} /> : <WeeklyMileageChart activities={activities} plan={plan} />}
          {isLoading ? <Skeleton height={300} /> : <RaceCountdowns races={races} />}
        </div>

        {/* Row 2: Training plan carousel */}
        <div style={{ marginBottom: '16px' }}>
          {isLoading ? <Skeleton height={168} /> : <WeekPlan plan={plan} activities={activities} />}
        </div>

        {/* Row 3: Recent activities 2/3 + Shoe health 1/3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          {isLoading ? <Skeleton height={380} /> : <RecentActivities activities={activities} plan={plan} />}
          {isLoading ? <Skeleton height={380} /> : <ShoeHealth shoes={shoes} gearMap={gearMap} />}
        </div>

        <div style={{
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
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
