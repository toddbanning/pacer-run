import React, { useRef, useEffect } from 'react';
import { metersToMiles } from '../lib/strava';
import { format, isToday, addDays, subDays, isFuture, isPast } from 'date-fns';

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
  'Easy':      'rgba(0,0,0,0.03)',
  'Off':       'transparent',
};

export default function WeekPlan({ plan, activities }) {
  const scrollRef = useRef(null);
  const todayRef = useRef(null);
  const now = new Date();

  // 14-day window: 6 back, today, 7 forward
  const days = [];
  for (let i = -6; i <= 7; i++) {
    const date = i < 0 ? subDays(now, Math.abs(i)) : addDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const planEntry = plan.find(p => p.date === dateStr);
    const actMiles = activities
      .filter(a => a.start_date?.startsWith(dateStr))
      .reduce((s, a) => s + metersToMiles(a.distance), 0);
    const roundedActual = Math.round(actMiles * 10) / 10;
    days.push({
      date,
      dateStr,
      dayLabel: format(date, 'EEE'),
      dateLabel: format(date, 'MMM d'),
      planEntry,
      actMiles: roundedActual,
      isToday: isToday(date),
      isPast: isPast(date) && !isToday(date),
      isFuture: isFuture(date),
    });
  }

  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const todayEl = todayRef.current;
      const offset = todayEl.offsetLeft - container.offsetWidth / 2 + todayEl.offsetWidth / 2;
      container.scrollLeft = offset;
    }
  }, []);

  const thisWeekActual = days
    .filter(d => !d.isFuture)
    .reduce((s, d) => s + d.actMiles, 0);
  const thisWeekPlanned = days
    .filter(d => d.planEntry)
    .reduce((s, d) => s + (d.planEntry?.plannedMiles || 0), 0);

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
          <span style={{ color: 'var(--mahogany)', fontWeight: 500 }}>{Math.round(thisWeekActual * 10) / 10}</span>
          {' / '}
          {Math.round(thisWeekPlanned * 10) / 10} mi this week
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
          const hasPlan = !!day.planEntry;
          const hasActual = day.actMiles > 0;
          const missed = day.isPast && !hasActual && hasPlan && day.planEntry?.plannedMiles > 0;

          return (
            <div
              key={i}
              ref={day.isToday ? todayRef : null}
              style={{
                flexShrink: 0,
                width: '86px',
                borderRadius: 'var(--radius)',
                border: '1px solid',
                borderColor: day.isToday ? 'var(--navy)' : 'var(--border)',
                background: day.isToday ? 'var(--navy)' : 'var(--bg-card)',
                overflow: 'hidden',
                opacity: missed ? 0.4 : 1,
              }}
            >
              {/* Date header section */}
              <div style={{
                padding: '8px 10px 6px',
                borderBottom: `1px solid ${day.isToday ? 'rgba(255,255,255,0.1)' : 'var(--border-light)'}`,
              }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: day.isToday ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {day.dayLabel}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: day.isToday ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)',
                  fontWeight: 500,
                  marginTop: '1px',
                }}>
                  {day.dateLabel}
                </div>
              </div>

              {/* Miles section */}
              <div style={{ padding: '8px 10px 10px' }}>
                {/* Workout type badge */}
                {hasPlan && type !== 'Off' && (
                  <div style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: day.isToday ? 'rgba(255,255,255,0.7)' : typeColor,
                    background: day.isToday ? 'rgba(255,255,255,0.1)' : typeBg,
                    borderRadius: '3px',
                    padding: '2px 5px',
                    marginBottom: '6px',
                    display: 'inline-block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {type}
                  </div>
                )}

                {/* Actual miles — past/today */}
                {hasActual && (
                  <div style={{ marginBottom: hasPlan ? '4px' : 0 }}>
                    <div style={{
                      fontSize: '18px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 300,
                      color: day.isToday ? '#E8B4BB' : 'var(--mahogany)',
                      lineHeight: 1,
                    }}>
                      {day.actMiles}
                    </div>
                    <div style={{
                      fontSize: '9px',
                      color: day.isToday ? 'rgba(255,255,255,0.35)' : 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '1px',
                    }}>
                      actual
                    </div>
                  </div>
                )}

                {/* Planned miles — always show if plan exists */}
                {hasPlan && day.planEntry.plannedMiles > 0 && (
                  <div style={{ marginTop: hasActual ? '4px' : 0 }}>
                    <div style={{
                      fontSize: hasActual ? '12px' : '18px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 300,
                      color: hasActual
                        ? (day.isToday ? 'rgba(255,255,255,0.35)' : 'var(--text-tertiary)')
                        : (day.isToday ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)'),
                      lineHeight: 1,
                    }}>
                      {day.planEntry.plannedMiles}
                    </div>
                    <div style={{
                      fontSize: '9px',
                      color: day.isToday ? 'rgba(255,255,255,0.3)' : 'var(--text-tertiary)',
                      fontFamily: 'var(--font-mono)',
                      marginTop: '1px',
                    }}>
                      planned
                    </div>
                  </div>
                )}

                {/* No plan, no actual */}
                {!hasPlan && !hasActual && (
                  <div style={{
                    fontSize: '14px',
                    color: day.isToday ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px',
                  }}>—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
