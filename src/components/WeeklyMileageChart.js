import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { metersToMiles } from '../lib/strava';
import { format, startOfWeek, addDays, subWeeks, isWithinInterval } from 'date-fns';

const RANGES = [
  { label: '4W', weeks: 4 },
  { label: '8W', weeks: 8 },
  { label: '16W', weeks: 16 },
  { label: '26W', weeks: 26 },
];

function buildWeeklyData(activities, plan, weeks) {
  const now = new Date();
  const result = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    const label = format(weekStart, 'MMM d');
    const actual = activities
      .filter(a => isWithinInterval(new Date(a.start_date), { start: weekStart, end: weekEnd }))
      .reduce((sum, a) => sum + metersToMiles(a.distance), 0);
    const planned = plan
      .filter(p => {
        try { return isWithinInterval(new Date(p.date), { start: weekStart, end: weekEnd }); }
        catch { return false; }
      })
      .reduce((sum, p) => sum + p.plannedMiles, 0);
    result.push({
      label,
      actual: Math.round(actual * 10) / 10,
      planned: Math.round(planned * 10) / 10,
      isCurrent: i === 0,
    });
  }
  return result;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const actual = payload.find(p => p.dataKey === 'actual')?.value || 0;
  const planned = payload.find(p => p.dataKey === 'planned')?.value || 0;
  const diff = planned > 0 ? Math.round((actual - planned) * 10) / 10 : null;
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      fontSize: '12px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ color: 'var(--text-tertiary)', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{label}</div>
      {actual > 0 && <div style={{ color: 'var(--mahogany)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{actual} mi actual</div>}
      {planned > 0 && <div style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{planned} mi planned</div>}
      {diff !== null && actual > 0 && (
        <div style={{ color: diff >= 0 ? '#2D7A4F' : '#B85C00', marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          {diff >= 0 ? '+' : ''}{diff} mi
        </div>
      )}
    </div>
  );
};

export default function WeeklyMileageChart({ activities, plan }) {
  const [range, setRange] = useState(8);
  const data = useMemo(() => buildWeeklyData(activities, plan, range), [activities, plan, range]);
  const avgActual = data.filter(d => d.actual > 0).length
    ? Math.round(data.filter(d => d.actual > 0).reduce((s, d) => s + d.actual, 0) / data.filter(d => d.actual > 0).length * 10) / 10
    : 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy)', letterSpacing: '0.01em' }}>Weekly Mileage</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {avgActual} mi avg · last {range} weeks
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setRange(r.weeks)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: range === r.weeks ? 'var(--navy)' : 'var(--border)',
                background: range === r.weeks ? 'var(--navy)' : 'transparent',
                color: range === r.weeks ? 'var(--white)' : 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.12s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7D2935" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#7D2935" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            interval={range <= 8 ? 0 : Math.floor(range / 8)}
          />
          <YAxis
            tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
          {avgActual > 0 && (
            <ReferenceLine
              y={avgActual}
              stroke="var(--mahogany)"
              strokeDasharray="3 3"
              strokeWidth={1}
              strokeOpacity={0.4}
            />
          )}
          <Area
            type="monotone"
            dataKey="planned"
            stroke="#1B2A4A"
            strokeWidth={1.5}
            strokeOpacity={0.35}
            fill="url(#plannedGrad)"
            dot={false}
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#7D2935"
            strokeWidth={2}
            fill="url(#actualGrad)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (!payload.actual) return null;
              return (
                <circle
                  key={`dot-${cx}-${cy}`}
                  cx={cx} cy={cy} r={payload.isCurrent ? 5 : 3}
                  fill={payload.isCurrent ? '#7D2935' : '#FFFFFF'}
                  stroke="#7D2935"
                  strokeWidth={payload.isCurrent ? 0 : 1.5}
                />
              );
            }}
            activeDot={{ r: 5, fill: '#7D2935', stroke: 'var(--white)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        {[
          { color: 'var(--mahogany)', label: 'Actual' },
          { color: 'var(--navy)', label: 'Planned', opacity: 0.4 },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 20, height: 2, background: l.color, opacity: l.opacity || 1, borderRadius: 1 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
