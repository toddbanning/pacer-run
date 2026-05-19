import React from 'react';
import { metersToMiles } from '../lib/strava';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, subWeeks, addDays } from 'date-fns';

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

  const StatBlock = ({ value, unit, label, highlight, large }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: large ? '26px' : '20px',
        fontFamily: 'var(--font-mono)',
        fontWeight: 300,
        color: highlight ? '#E8B4BB' : large ? 'var(--white)' : 'rgba(255,255,255,0.75)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '2px',
      }}>
        {value}
        {unit && <span style={{ fontSize: large ? '13px' : '11px', color: 'rgba(255,255,255,0.35)', marginLeft: '2px' }}>{unit}</span>}
      </div>
      <div style={{
        fontSize: '10px',
        color: 'rgba(255,255,255,0.38)',
        fontFamily: 'var(--font-mono)',
        marginTop: '4px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );

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
          fontSize: '20px',
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
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 300,
            marginTop: '3px',
          }}>
            Personalized training dashboard for {athleteName}
          </div>
        )}
      </div>

      {/* Stats — Last Week | THIS WEEK (center, larger) | Planned Next Week | Phase */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>

        <StatBlock
          value={Math.round(lastWeekActual * 10) / 10}
          unit="mi"
          label="Last Week"
        />

        {/* Divider */}
        <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />

        {/* THIS WEEK — center, highlighted */}
        <StatBlock
          value={Math.round(thisWeekActual * 10) / 10}
          unit="mi"
          label="This Week"
          highlight
          large
        />

        {/* Divider */}
        <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.1)' }} />

        <StatBlock
          value={nextWeekPlanned > 0 ? Math.round(nextWeekPlanned * 10) / 10 : '—'}
          unit={nextWeekPlanned > 0 ? 'mi' : ''}
          label="Planned Next Wk"
        />

        <StatBlock
          value={settings.training_phase || '—'}
          unit=""
          label="Phase"
        />
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
