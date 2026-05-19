import React from 'react';
import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';

function RaceCard({ race }) {
  const raceDate = parseISO(race.date);
  const today = new Date();
  const daysOut = differenceInDays(raceDate, today);
  const weeksOut = differenceInWeeks(raceDate, today);
  const isPast = daysOut < 0;

  return (
    <div style={{
      background: isPast ? 'var(--bg-subtle)' : 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      borderLeft: `3px solid ${isPast ? 'var(--border)' : 'var(--mahogany)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: isPast ? 'var(--text-tertiary)' : 'var(--text-primary)', marginBottom: '2px' }}>
            {race.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {race.date} · {race.distance}mi
          </div>
        </div>
        {!isPast && (
          <div style={{ textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
            <div style={{
              fontSize: '28px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 300,
              color: 'var(--mahogany)',
              lineHeight: 1,
            }}>
              {daysOut}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>
              days · {weeksOut}wk
            </div>
          </div>
        )}
        {isPast && race.result && (
          <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginLeft: '12px' }}>
            {race.result}
          </div>
        )}
      </div>

      {(race.goalTime || race.goalType) && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
          {race.goalTime && (
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--mahogany)',
              background: 'var(--mahogany-subtle)',
              border: '1px solid var(--mahogany-light)',
              borderRadius: '4px',
              padding: '3px 8px',
            }}>
              {race.goalTime}
            </div>
          )}
          {race.goalType && (
            <div style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '3px 8px',
              fontFamily: 'var(--font-mono)',
            }}>
              {race.goalType}
            </div>
          )}
        </div>
      )}

      {race.courseNotes && (
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px', fontStyle: 'italic' }}>
          {race.courseNotes}
        </div>
      )}
    </div>
  );
}

export default function RaceCountdowns({ races }) {
  const upcoming = races
    .filter(r => r.status !== 'Completed')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy)', marginBottom: '14px' }}>Upcoming Races</div>
      {upcoming.length === 0 ? (
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No upcoming races scheduled.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {upcoming.map((race, i) => <RaceCard key={i} race={race} />)}
        </div>
      )}
    </div>
  );
}
