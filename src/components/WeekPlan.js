import React, { useRef, useEffect } from 'react';
import { metersToMiles } from '../lib/strava';
import { parseISO, format, isToday, addDays, subDays } from 'date-fns';

const TYPE_COLORS = {
  'Speed':     '#C0392B',
  'Tempo':     '#6B3FA0',
  'Threshold': '#1A6B45',
  'Long Run':  '#B85C00',
  'Easy':      'var(--text-tertiary)',
  'Off':       'var(--border)',
};

const TYPE_BG = {
  'Speed':     'rgba(192,57,43,0.08)',
  'Tempo':     'rgba(107,63,160,0.08)',
  'Threshold': 'rgba(26,107,69,0.08)',
  'Long Run':  'rgba(184,92,0,0.08)',
  'Easy':      'var(--bg-subtle)',
  'Off':       'transparent',
};

export default function WeekPlan({ plan, activities }) {
  const scrollRef = useRef(null);
  const todayRef = useRef(null);
  const now = new Date();

  // Build a 14-day window: 6 days back, today, 7 days forward
  const days = [];
  for (let i = -6; i <= 7; i++) {
    const date = i < 0 ? subDays(now, Math.abs(i)) : addDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const planEntry = plan.find(p => p.date === dateStr);
    const actMiles = activities
      .filter(a => a.start_date?.startsWith(dateStr))
      .reduce((s, a) => s + metersToMiles(a.distance), 0);
    days.push({
      date,
      dateStr,
      dayLabel: format(date, 'EEE'),
      dateLabel: format(date, 'MMM d'),
      planEntry,
      actMiles: Math.round(actMiles * 10) / 10,
      isToday: isToday(date),
      isPast: date < now && !isToday(date),
    });
  }

  // Scroll today into center on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const todayEl = todayRef.current;
      const offset = todayEl.offsetLeft - container.offsetWidth / 2 + todayEl.offsetWidth / 2;
      container.scrollLeft = offset;
    }
  }, []);

  const totalPlanned = days
    .filter(d => d.isToday || !d.isPast)
    .filter(d => d.planEntry)
    .reduce((s, d) => s + (d.planEntry?.plannedMiles || 0), 0);
  const totalActual = days
    .filter(d => d.isPast || d.isToday)
    .reduce((s, d) => s + d.actMiles, 0);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy)' }}>Training Plan</div>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
          <span style={{ color: 'var(--mahogany)', fontWeight: 500 }}>{Math.round(totalActual * 10) / 10}</span>
          {' / '}
          {Math.round(totalPlanned * 10) / 10} mi this week
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {days.map((day, i) => {
          const type = day.planEntry?.workoutType || 'Off';
          const typeColor = TYPE_COLORS[type] || 'var(--text-tertiary)';
          const typeBg = TYPE_BG[type] || 'transparent';
          const done = day.actMiles > 0;
          const missed = day.isPast && !done && day.planEntry?.plannedMiles > 0;

          return (
            <div
              key={i}
              ref={day.isToday ? todayRef : null}
              style={{
                flexShrink: 0,
                width: '88px',
                borderRadius: 'var(--radius)',
                border: '1px solid',
                borderColor: day.isToday ? 'var(--navy)' : 'var(--border)',
                background: day.isToday ? 'var(--navy)' : 'var(--bg-card)',
                padding: '10px 10px 12px',
                opacity: missed ? 0.45 : day.isPast && !done && !day.planEntry ? 0.35 : 1,
                position: 'relative',
              }}
            >
              {/* Day header */}
              <div style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: day.isToday ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '2px',
              }}>
                {day.dayLabel}
              </div>
              <div style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: day.isToday ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                marginBottom: '10px',
              }}>
                {day.dateLabel}
              </div>

              {/* Workout type badge */}
              {day.planEntry && (
                <div style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  color: day.isToday ? 'rgba(255,255,255,0.8)' : typeColor,
                  background: day.isToday ? 'rgba(255,255,255,0.1)' : typeBg,
                  borderRadius: '3px',
                  padding: '2px 5px',
                  marginBottom: '8px',
                  display: 'inline-block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {type}
                </div>
              )}

              {/* Miles */}
              <div style={{ marginTop: day.planEntry ? 0 : '18px' }}>
                {done ? (
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 300,
                      color: day.isToday ? '#E8B4BB' : 'var(--mahogany)',
                      lineHeight: 1,
                    }}>
                      {day.actMiles}
                    </div>
                    <div style={{ fontSize: '9px', color: day.isToday ? 'rgba(255,255,255,0.4)' : 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      actual
                    </div>
                  </div>
                ) : day.planEntry ? (
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 300,
                      color: day.isToday ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)',
                      lineHeight: 1,
                    }}>
                      {day.planEntry.plannedMiles}
                    </div>
                    <div style={{ fontSize: '9px', color: day.isToday ? 'rgba(255,255,255,0.4)' : 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      planned
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '12px',
                    color: day.isToday ? 'rgba(255,255,255,0.3)' : 'var(--border)',
                    fontFamily: 'var(--font-mono)',
                  }}>—</div>
                )}
              </div>

              {/* Completion check */}
              {done && day.planEntry && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: day.isToday ? 'rgba(255,255,255,0.15)' : 'var(--navy-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  color: day.isToday ? 'rgba(255,255,255,0.7)' : 'var(--navy)',
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
