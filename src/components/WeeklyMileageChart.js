import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
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
      .filter(a => {
        const d = new Date(a.start_date);
        return isWithinInterval(d, { start: weekStart, end: weekEnd });
      })
      .reduce((sum, a) => sum + metersToMiles(a.distance), 0);

    const planned = plan
      .filter(p => {
        const d = new Date(p.date);
        return isWithinInterval(d, { start: weekStart, end: weekEnd });
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
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      fontSize: '12px',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>{label}</div>
      {actual > 0 && <div style={{ color: 'var(--accent)' }}>{actual} mi actual</div>}
      {planned > 0 && <div style={{ color: 'var(--text-tertiary)' }}>{planned} mi planned</div>}
      {actual > 0 && planned > 0 && (
        <div style={{ color: actual >= planned ? 'var(--green)' : 'var(--orange)', marginTop: '4px' }}>
          {actual >= planned ? '+' : ''}{Math.round((actual - planned) * 10) / 10} mi
        </div>
      )}
    </div>
  );
};

export default function WeeklyMileageChart({ activities, plan }) {
  const [range, setRange] = useState(8);
  const data = useMemo(() => buildWeeklyData(activities, plan, range), [activities, plan, range]);
  const avgActual = data.length ? Math.round(data.reduce((s, d) => s + d.actual, 0) / data.length * 10) / 10 : 0;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Weekly Mileage</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            avg {avgActual} mi/wk
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
                borderColor: range === r.weeks ? 'var(--accent)' : 'var(--border)',
                background: range === r.weeks ? 'var(--accent-subtle)' : 'transparent',
                color: range === r.weeks ? 'var(--accent)' : 'var(--text-tertiary)',
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
        <BarChart data={data} barGap={2} barCategoryGap="25%">
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          {avgActual > 0 && (
            <ReferenceLine y={avgActual} stroke="var(--text-tertiary)" strokeDasharray="3 3" strokeWidth={1} />
          )}
          <Bar dataKey="planned" fill="var(--border-light)" radius={[2, 2, 0, 0]} maxBarSize={20}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isCurrent ? 'var(--border)' : 'var(--border-light)'} />
            ))}
          </Bar>
          <Bar dataKey="actual" radius={[2, 2, 0, 0]} maxBarSize={20}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isCurrent ? 'var(--accent)' : 'rgba(232,255,107,0.6)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        {[
          { color: 'rgba(232,255,107,0.6)', label: 'Actual' },
          { color: 'var(--border-light)', label: 'Planned' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
