import React from 'react';
import { metersToMiles } from '../lib/strava';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInDays } from 'date-fns';

export default function HeaderStats({ activities, plan, races, settings, onLogout }) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const thisWeekActual = activities
    .filter(a => isWithinInterval(new Date(a.start_date), { start: weekStart, end: weekEnd }))
    .reduce((s, a) => s + metersToMiles(a.distance), 0);

  const thisWeekPlanned = plan
    .filter(p => {
      try { return isWithinInterval(parseISO(p.date), { start: weekStart, end: weekEnd }); }
      catch { return false; }
    })
    .reduce((s, p) => s + p.plannedMiles, 0);

  const nextRace = races
    .filter(r => r.status !== 'Completed' && new Date(r.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const daysToRace = nextRace ? differenceInDays(new Date(nextRace.date), now) : null;

  const fourWeeksAgo = new Date(now - 28 * 86400 * 1000);
  const recentMiles = activities
    .filter(a => new Date(a.start_date) > fourWeeksAgo)
    .reduce((s, a) => s + metersToMiles(a.distance), 0);
  const avgWeeklyMiles = Math.round(recentMiles / 4 * 10) / 10;

  const pctComplete = thisWeekPlanned > 0
    ? Math.min(Math.round((thisWeekActual / thisWeekPlanned) * 100), 100)
    : null;

  return (
    <div style={{
      background: 'var(--navy)',
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        letterSpacing: '0.25em',
        color: 'var(--white)',
        textTransform: 'uppercase',
        fontWeight: 500,
        opacity: 0.9,
      }}>
        Pacer
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* This week */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '22px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 300,
            color: 'var(--white)',
            lineHeight: 1,
          }}>
            <span style={{ color: '#E8B4BB' }}>{Math.round(thisWeekActual * 10) / 10}</span>
            {thisWeekPlanned > 0 && (
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>
                / {Math.round(thisWeekPlanned * 10) / 10}
              </span>
            )}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', marginTop: '3px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            This Week {pctComplete !== null ? `· ${pctComplete}%` : ''}
          </div>
        </div>

        {/* 4-week avg */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '22px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 300,
            color: 'var(--white)',
            lineHeight: 1,
          }}>
            {avgWeeklyMiles}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', marginTop: '3px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            mi / wk avg
          </div>
        </div>

        {/* Phase */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            color: 'var(--white)',
            lineHeight: 1,
          }}>
            {settings.training_phase || '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', marginTop: '3px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Phase
          </div>
        </div>

        {/* Next race countdown */}
        {daysToRace !== null && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '22px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 300,
              color: '#E8B4BB',
              lineHeight: 1,
            }}>
              {daysToRace}d
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)', marginTop: '3px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {nextRace.name}
            </div>
          </div>
        )}
      </div>

      {/* Disconnect */}
      <button
        onClick={onLogout}
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
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
