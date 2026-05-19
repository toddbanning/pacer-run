import React from 'react';
import { metersToMiles } from '../lib/strava';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInDays } from 'date-fns';

export default function HeaderStats({ activities, plan, races, settings, onLogout }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // This week actual miles
  const thisWeekActual = activities
    .filter(a => isWithinInterval(new Date(a.start_date), { start: weekStart, end: weekEnd }))
    .reduce((s, a) => s + metersToMiles(a.distance), 0);

  // This week planned miles
  const thisWeekPlanned = plan
    .filter(p => {
      try { return isWithinInterval(parseISO(p.date), { start: weekStart, end: weekEnd }); }
      catch { return false; }
    })
    .reduce((s, p) => s + p.plannedMiles, 0);

  // Next race
  const nextRace = races
    .filter(r => r.status !== 'Completed' && new Date(r.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const daysToRace = nextRace ? differenceInDays(new Date(nextRace.date), now) : null;

  // 4-week rolling avg
  const fourWeeksAgo = new Date(now - 28 * 86400 * 1000);
  const recentMiles = activities
    .filter(a => new Date(a.start_date) > fourWeeksAgo)
    .reduce((s, a) => s + metersToMiles(a.distance), 0);
  const avgWeeklyMiles = Math.round(recentMiles / 4 * 10) / 10;

  const stats = [
    {
      label: 'This Week',
      value: `${Math.round(thisWeekActual * 10) / 10} mi`,
      sub: thisWeekPlanned ? `of ${Math.round(thisWeekPlanned * 10) / 10} planned` : 'no plan loaded',
      accent: thisWeekActual >= thisWeekPlanned && thisWeekPlanned > 0,
    },
    {
      label: '4-Week Avg',
      value: `${avgWeeklyMiles} mi/wk`,
      sub: 'rolling average',
    },
    {
      label: 'Training Phase',
      value: settings.training_phase || '—',
      sub: 'current block',
    },
    ...(daysToRace !== null ? [{
      label: nextRace.name,
      value: `${daysToRace}d`,
      sub: nextRace.goalTime ? `Goal: ${nextRace.goalTime}` : 'upcoming',
      accent: daysToRace <= 42,
    }] : []),
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 0 20px 0',
      borderBottom: '1px solid var(--border)',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        letterSpacing: '0.15em',
        color: 'var(--accent)',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}>
        Pacer
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 300,
              color: s.accent ? 'var(--accent)' : 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '5px 10px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        disconnect
      </button>
    </div>
  );
}
