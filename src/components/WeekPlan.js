import React, { useRef, useEffect } from 'react';
import { metersToMiles } from '../lib/strava';
import { format, isToday, addDays, subDays, isFuture, isPast, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const TYPE_COLORS = {
  'Speed':     '#C0392B',
  'Tempo':     '#6B3FA0',
  'Threshold': '#1A6B45',
  'Long Run':  '#B85C00',
  'Easy':      '#888480',
  'Off':       '#CCCCCC',
};

export default function WeekPlan({ plan, activities }) {
  const scrollRef = useRef(null);
  const todayRef = useRef(null);
  const now = new Date();

  const days = [];
  for (let i = -6; i <= 7; i++) {
    const date = i < 0 ? subDays(now, Math.abs(i)) : addDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const planEntry = plan.find(p => p.date === dateStr);
    const actMiles = activities
      .filter(a => a.start_date?.startsWith(dateStr))
      .reduce((s, a) => s + metersToMiles(a.distance), 0);
    days.push({
      date, dateStr,
      dayLabel: format(date, 'EEE'),
      dateLabel: format(date, 'MMM d'),
      planEntry,
      actMiles: Math.round(actMiles * 10) / 10,
      isToday: isToday(date),
      isPast: isPast(date) && !isToday(date),
      isFuture: isFuture(date),
    });
  }

  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = todayRef.current;
      container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
    }
  }, []);

  // This week plan vs actual
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisWeekActual = activities
    .filter(a => isWithinInterval(new Date(a.start_date), { start: weekStart, end: weekEnd }))
    .reduce((s, a) => s + metersToMiles(a.distance), 0);
  const thisWeekPlanned = plan
    .filter(p => {
      try { return isWithinInterval(new Date(p.date), { start: weekStart, end: weekEnd }); }
      catch { return false; }
    })
    .reduce((s, p) => s + p.plannedMiles, 0);

  const pct = thisWeekPlanned > 0
    ? Math.round((thisWeekActual / thisWeekPlanned) * 100)
    : null;

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
        {pct !== null && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span style={{ color: 'var(--mahogany)', fontWeight: 500, fontSize: '13px' }}>{pct}%</span>
            {' '}of planned this week
          </div>
        )}
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
          const typeColor = TYPE_COLORS[type] || '#888480';
          const hasActual = day.actMiles > 0;
          const hasPlan = !!day.planEntry && day.planEntry.plannedMiles > 0;
          const dark = day.isToday;

          const sectionBorder = dark
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid var(--border-light)';

          return (
            <div
              key={i}
              ref={day.isToday ? todayRef : null}
              style={{
                flexShrink: 0,
                width: '90px',
                borderRadius: 'var(--radius)',
                border: `1px solid ${dark ? 'var(--navy)' : 'var(--border)'}`,
                background: dark ? 'var(--navy)' : 'var(--bg-card)',
                overflow: 'hidden',
                opacity: (day.isPast && !hasActual && hasPlan) ? 0.4 : 1,
              }}
            >
              {/* TOP: Day + Date */}
              <div style={{
                padding: '7px 10px',
                borderBottom: sectionBorder,
              }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: dark ? 'rgba(255,255,255,0.45)' : 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {day.dayLabel}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  color: dark ? 'rgba(255,255,255,0.9)' : 'var(--text-primary)',
                  marginTop: '1px',
                }}>
                  {day.dateLabel}
                </div>
              </div>

              {/* MIDDLE: Planned miles + workout type */}
              <div style={{
                padding: '7px 10px',
                borderBottom: sectionBorder,
                minHeight: '52px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                {hasPlan ? (
                  <>
                    <div style={{
                      fontSize: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 400,
                      color: dark ? 'rgba(255,255,255,0.85)' : 'var(--text-primary)',
                      lineHeight: 1,
                    }}>
                      {day.planEntry.plannedMiles}
                      <span style={{ fontSize: '10px', color: dark ? 'rgba(255,255,255,0.35)' : 'var(--text-tertiary)', marginLeft: '2px' }}>mi</span>
                    </div>
                    {type !== 'Off' && (
                      <div style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: dark ? 'rgba(255,255,255,0.6)' : typeColor,
                        marginTop: '3px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {type}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '12px', color: dark ? 'rgba(255,255,255,0.2)' : 'var(--border)', fontFamily: 'var(--font-mono)' }}>—</div>
                )}
              </div>

              {/* BOTTOM: Actual miles */}
              <div style={{
                padding: '7px 10px',
                minHeight: '44px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                {hasActual ? (
                  <>
                    <div style={{
                      fontSize: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 400,
                      color: dark ? '#E8B4BB' : 'var(--mahogany)',
                      lineHeight: 1,
                    }}>
                      {day.actMiles}
                      <span style={{ fontSize: '10px', color: dark ? 'rgba(255,255,255,0.35)' : 'var(--text-tertiary)', marginLeft: '2px' }}>mi</span>
                    </div>
                    <div style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      color: dark ? 'rgba(255,255,255,0.3)' : 'var(--text-tertiary)',
                      marginTop: '2px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      actual
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '11px', color: dark ? 'rgba(255,255,255,0.2)' : 'var(--border)', fontFamily: 'var(--font-mono)' }}>—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}