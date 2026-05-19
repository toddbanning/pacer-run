import React from 'react';
import { metersToMiles, secondsToPace, formatDuration } from '../lib/strava';
import { format, parseISO } from 'date-fns';

const WORKOUT_TYPE_COLORS = {
  'Speed':         'var(--red)',
  'Tempo':         '#b06bff',
  'Threshold':     'var(--green)',
  'Long Run':      'var(--orange)',
  'VO2 Max':       'var(--red)',
  'Easy':          'var(--text-tertiary)',
  'Race Sharpener':'var(--accent)',
};

function inferWorkoutType(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('tempo')) return 'Tempo';
  if (n.includes('long') || n.includes('lr')) return 'Long Run';
  if (n.includes('800') || n.includes('400') || n.includes('200') || n.includes('speed')) return 'Speed';
  if (n.includes('threshold') || n.includes('1k') || n.includes('interval')) return 'Threshold';
  if (n.includes('vo2') || n.includes('vo₂')) return 'VO2 Max';
  if (n.includes('race') || n.includes('marathon') || n.includes('half')) return 'Race';
  return 'Easy';
}

function ActivityRow({ activity, planEntry }) {
  const miles = metersToMiles(activity.distance);
  const pace = secondsToPace(activity.moving_time, activity.distance);
  const date = format(parseISO(activity.start_date), 'EEE MMM d');
  const type = inferWorkoutType(activity.name);
  const typeColor = WORKOUT_TYPE_COLORS[type] || 'var(--text-tertiary)';
  const plannedMiles = planEntry?.plannedMiles || 0;
  const diff = plannedMiles ? Math.round((miles - plannedMiles) * 10) / 10 : null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px 1fr auto auto auto',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
        {date}
      </div>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px' }}>
          {activity.name}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '10px',
            color: typeColor,
            fontFamily: 'var(--font-mono)',
            border: `1px solid ${typeColor}33`,
            borderRadius: '3px',
            padding: '1px 5px',
          }}>
            {type}
          </span>
          {activity.gear_id && (
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
              {activity.gear?.name || ''}
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
          {miles} mi
        </div>
        {diff !== null && (
          <div style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: diff >= 0 ? 'var(--green)' : 'var(--orange)',
          }}>
            {diff >= 0 ? '+' : ''}{diff} vs plan
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {pace}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          /mi
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {activity.average_heartrate ? (
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {Math.round(activity.average_heartrate)} bpm
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>—</div>
        )}
        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {formatDuration(activity.moving_time)}
        </div>
      </div>
    </div>
  );
}

export default function RecentActivities({ activities, plan }) {
  const recent = [...activities]
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 10);

  if (!recent.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Recent Activities</div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No recent activities found.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>Recent Activities</div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          last {recent.length} runs
        </div>
      </div>

      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr auto auto auto',
        gap: '12px',
        padding: '8px 0',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '2px',
      }}>
        {['Date', 'Activity', 'Miles', 'Pace', 'HR / Time'].map(h => (
          <div key={h} style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            textAlign: h === 'Date' || h === 'Activity' ? 'left' : 'right',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {h}
          </div>
        ))}
      </div>

      {recent.map(activity => {
        const actDate = activity.start_date?.split('T')[0];
        const planEntry = plan.find(p => p.date === actDate);
        return <ActivityRow key={activity.id} activity={activity} planEntry={planEntry} />;
      })}
    </div>
  );
}
