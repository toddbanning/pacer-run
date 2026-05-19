import React from 'react';
import { differenceInDays, differenceInWeeks, parseISO } from 'date-fns';

function RaceCard({ race }) {
  const raceDate = parseISO(race.date);
  const today = new Date();
  const daysOut = differenceInDays(raceDate, today);
  const weeksOut = differenceInWeeks(raceDate, today);
  const isPast = daysOut < 0;

  const urgencyColor = daysOut <= 14 ? 'var(--red)' :
    daysOut <= 42 ? 'var(--orange)' : 'var(--accent)';

  return (
    <div style={{
      background: 'var(--bg-subtle)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '16px',
      borderLeft: `3px solid ${isPast ? 'var(--text-tertiary)' : urgencyColor}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: isPast ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
            {race.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {race.date} · {race.distance}mi
          </div>
        </div>
        {!isPast && (
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 300,
              fontFamily: 'var(--font-mono)',
              color: urgencyColor,
              lineHeight: 1,
            }}>
              {daysOut}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              days · {weeksOut}wk
            </div>
          </div>
        )}
        {isPast && race.result && (
          <div style={{
            fontSize: '16px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}>
            {race.result}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {race.goalTime && (
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: urgencyColor,
            background: 'rgba(232,255,107,0.06)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '3px 8px',
          }}>
            Goal: {race.goalTime}
          </div>
        )}
        {race.goalType && (
          <div style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '3px 8px',
          }}>
            {race.goalType}
          </div>
        )}
      </div>

      {race.courseNotes && (
        <div style={{
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          marginTop: '8px',
          fontStyle: 'italic',
        }}>
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

  if (!upcoming.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Upcoming Races</div>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No upcoming races scheduled.</p>
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
      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>Upcoming Races</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {upcoming.map((race, i) => <RaceCard key={i} race={race} />)}
      </div>
    </div>
  );
}
