import React from 'react';
import { metersToMiles, secondsToPace, formatDuration } from '../lib/strava';
import { format, parseISO } from 'date-fns';

const TYPE_COLORS = {
  'Speed':     '#C0392B',
  'Tempo':     '#6B3FA0',
  'Threshold': '#1A6B45',
  'Long Run':  '#B85C00',
  'Easy':      'var(--text-tertiary)',
  'Race':      'var(--mahogany)',
};

function inferWorkoutType(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('tempo')) return 'Tempo';
  if (n.includes('long') || n.includes('lr')) return 'Long Run';
  if (n.includes('800') || n.includes('400') || n.includes('200') || n.includes('speed')) return 'Speed';
  if (n.includes('threshold') || n.includes('1k') || n.includes('interval')) return 'Threshold';
  if (n.includes('vo2')) return 'VO2 Max';
  if (n.includes('race') || n.includes('marathon') || n.includes('half')) return 'Race';
  return 'Easy';
}

function ActivityRow({ activity, planEntry, isLast }) {
  const miles = metersToMiles(activity.distance);
  const pace = secondsToPace(activity.moving_time, activity.distance);
  const date = format(parseISO(activity.start_date), 'EEE MMM d');
  const type = inferWorkoutType(activity.name);
  const typeColor = TYPE_COLORS[type] || 'var(--text-tertiary)';
  const plannedMiles = planEntry?.plannedMiles || 0;
  const diff = plannedMiles ? Math.round((miles - plannedMiles) * 10) / 10 : null;
  const gearName = activity.gear?.name || '';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: '12px',
      padding: '11px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
    }}>
      {/* Left: name + meta */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '13px',
            color: 'var(--text-primary)',
            fontWeight: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activity.name}
          </span>
          <span style={{
            fontSize: '10px',
            color: typeColor,
            fontFamily: 'var(--font-mono)',
            border: `1px solid ${typeColor}33`,
            borderRadius: '3px',
            padding: '1px 5px',
            flexShrink: 0,
          }}>
            {type}
          </span>
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--mahogany)', fontWeight: 500 }}>
            {miles} mi
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {pace}<span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>/mi</span>
          </span>
          {activity.average_heartrate && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {Math.round(activity.average_heartrate)}<span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}> bpm</span>
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            {formatDuration(activity.moving_time)}
          </span>
          {diff !== null && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: diff >= 0 ? '#2D7A4F' : '#B85C00',
            }}>
              {diff >= 0 ? '+' : ''}{diff} vs plan
            </span>
          )}
        </div>
      </div>

      {/* Right: date + shoe */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
          {date}
        </div>
        {gearName && (
          <div style={{
            fontSize: '10px',
            color: 'var(--navy)',
            background: 'var(--navy-subtle)',
            borderRadius: '3px',
            padding: '2px 6px',
            fontFamily: 'var(--font-mono)',
            display: 'inline-block',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {gearName}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecentActivities({ activities, plan }) {
  const recent = [...activities]
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 10);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy)' }}>Recent Activities</div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          last {recent.length} runs
        </div>
      </div>

      {recent.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px' }}>No recent activities found.</p>
      ) : (
        recent.map((activity, i) => {
          const actDate = activity.start_date?.split('T')[0];
          const planEntry = plan.find(p => p.date === actDate);
          return (
            <ActivityRow
              key={activity.id}
              activity={activity}
              planEntry={planEntry}
              isLast={i === recent.length - 1}
            />
          );
        })
      )}
    </div>
  );
}
