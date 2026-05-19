import React from 'react';
import { metersToMiles } from '../lib/strava';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format, isToday, isPast } from 'date-fns';

const TYPE_COLORS = {
  'Speed':    'var(--red)',
  'Tempo':    '#b06bff',
  'Threshold':'var(--green)',
  'Long Run': 'var(--orange)',
  'Easy':     'var(--text-tertiary)',
  'Off':      'var(--text-tertiary)',
};

export default function WeekPlan({ plan, activities }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const thisWeekPlan = plan.filter(p => {
    try {
      return isWithinInterval(parseISO(p.date), { start: weekStart, end: weekEnd });
    } catch { return false; }
  });

  const totalPlanned = thisWeekPlan.reduce((s, p) => s + p.plannedMiles, 0);

  const actsByDate = {};
  activities.forEach(a => {
    const d = a.start_date?.split('T')[0];
    if (!d) return;
    if (!actsByDate[d]) actsByDate[d] = 0;
    actsByDate[d] += metersToMiles(a.distance);
  });

  const totalActual = thisWeekPlan.reduce((s, p) => {
    return s + (actsByDate[p.date] || 0);
  }, 0);

  if (!thisWeekPlan.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>This Week</div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          No plan loaded for this week. Add sessions to your Training Plan sheet.
        </p>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>This Week</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--accent)' }}>{Math.round(totalActual * 10) / 10}</span>
            {' / '}
            <span>{Math.round(totalPlanned * 10) / 10} mi</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {thisWeekPlan.map((day, i) => {
          const actual = actsByDate[day.date] || 0;
          const done = actual > 0;
          const today = isToday(parseISO(day.date));
          const past = isPast(parseISO(day.date)) && !today;
          const missed = past && !done && day.plannedMiles > 0;
          const typeColor = TYPE_COLORS[day.workoutType] || 'var(--text-tertiary)';

          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '72px 60px 1fr auto',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: 'var(--radius)',
                background: today ? 'var(--accent-subtle)' : 'transparent',
                border: today ? '1px solid rgba(232,255,107,0.15)' : '1px solid transparent',
                opacity: missed ? 0.5 : 1,
              }}
            >
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: today ? 'var(--accent)' : 'var(--text-tertiary)',
              }}>
                {format(parseISO(day.date), 'EEE d')}
              </div>

              <div style={{
                fontSize: '10px',
                color: typeColor,
                fontFamily: 'var(--font-mono)',
                border: `1px solid ${typeColor}33`,
                borderRadius: '3px',
                padding: '1px 5px',
                textAlign: 'center',
              }}>
                {day.workoutType}
              </div>

              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {day.description}
              </div>

              <div style={{ textAlign: 'right', minWidth: '70px' }}>
                {done ? (
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                    ✓ {Math.round(actual * 10) / 10}
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                    {day.plannedMiles} mi
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
