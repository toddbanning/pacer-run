import React from 'react';
import { metersToMiles } from '../lib/strava';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInDays, subWeeks, addDays } from 'date-fns';

export default function HeaderStats({ activities, plan, races, settings, athleteName, onLogout }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // This week actual
  const thisWeekActual = activities
    .filter(a => isWithinInterval(new Date(a.start_date), { start: weekStart, end: weekEnd }))
    .reduce((s, a) => s + metersToMiles(a.distance), 0);

  // Last week total
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekActual = activities
    .filter(a => isWithinInterval(new Date(a.start_date), { start: lastWeekStart, end: lastWeekEnd }))
    .reduce((s, a) => s + metersToMiles(a.distance), 0);

  // Next week planned
  const nextWeekStart = startOfWeek(addDays(now, 7), { weekStartsOn: 1 });
  const nextWeekEnd = endOfWeek(addDays(now, 7), { weekStartsOn: 1 });
  const nextWeekPlanned = plan
    .filter(p => {
      try { return isWithinInterval(parseISO(p.date), { start: nextWeekStart, end: nextWeekEnd }); }
      catch { return false; }
    })
    .reduce((s, p) => s + p.plannedMiles, 0);

  // Next race
  const nextRace = races
    .filter(r => r.status !== 'Completed' && new Date(r.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const daysToRace = nextRace ? differenceInDays(new Date(nextRace.date), now) : null;

  const stats = [
    {
      value: Math.round(thisWeekActual * 10) / 10,
      unit: 'mi',
      label: 'This Week',
      highlight: true,
    },
    {
      value: Math.round(lastWeekActual * 10) / 10,
      unit: 'mi',
      label: 'Last Week',
    },
    {
      value: nextWeekPlanned > 0 ? Math.round(nextWeekPlanned * 10) / 10 : '—',
      unit: nextWeekPlanned > 0 ? 'mi' : '',
      label: 'Planned Next Week',
    },
    {
      value: settings.training_phase || '—',
      unit: '',
      label: 'Phase',
      isText: true,
    },
    ...(daysToRace !== null ? [{
      value: daysToRace,
      unit: 'd',
      label: nextRace.name,
      highlight: daysToRace <= 42,
    }] : []),
  ];

  return (
    <div style={{
      background: 'var(--navy)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      {/* Logo + subheading */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '18px',
          letterSpacing: '0.2em',
          color: 'var(--white)',
          textTransform: 'uppercase',
          fontWeight: 500,
          lineHeight: 1.1,
        }}>
          Pacer
        </div>
        {athleteName && (
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            marginTop: '3px',
            letterSpacing: '0.01em',
          }}>
            Personalized training dashboard for {athleteName}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', alignItems: 'center' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: s.isText ? '14px' : '22px',
              fontFamily: s.isText ? 'var(--font-sans)' : 'var(--font-mono)',
              fontWeight: 300,
              color: s.highlight ? '#E8B4BB' : 'var(--white)',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'baseline',
              gap: '2px',
              justifyContent: 'center',
            }}>
              {s.value}
              {s.unit && (
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginLeft: '2px' }}>
                  {s.unit}
                </span>
              )}
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-mono)',
              marginTop: '4px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Disconnect */}
      <button
        onClick={onLogout}
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 'var(--radius)',
          padding: '5px 12px',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.05em',
        }}
      >
        disconnect
      </button>
    </div>
  );
}
