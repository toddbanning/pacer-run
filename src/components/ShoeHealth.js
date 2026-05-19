import React from 'react';
import { metersToMiles } from '../lib/strava';

const TYPE_LABELS = {
  'Daily trainer':     'Daily',
  'Easy / recovery':  'Easy',
  'Uptempo trainer':  'Uptempo',
  'Workout trainer':  'Workout',
  'Race / super shoe':'Race',
  'Workout / race':   'Race/WO',
};

function getStatus(pct) {
  if (pct >= 1)   return { label: 'Retire',  color: 'var(--mahogany)' };
  if (pct >= 0.8) return { label: 'Watch',   color: '#B85C00' };
  return               { label: 'Good',    color: '#2D7A4F' };
}

export default function ShoeHealth({ shoes, activities }) {
  const gearMiles = {};
  const gearNames = {};
  activities.forEach(a => {
    if (a.gear_id) {
      gearMiles[a.gear_id] = (gearMiles[a.gear_id] || 0) + metersToMiles(a.distance);
      if (a.gear?.name) gearNames[a.gear_id] = a.gear.name;
    }
  });

  const shoeData = shoes.map(shoe => {
    const gearEntry = Object.entries(gearNames).find(([, name]) => name === shoe.name);
    const currentMiles = gearEntry ? Math.round(gearMiles[gearEntry[0]] || 0) : 0;
    const pct = currentMiles / shoe.retirementMiles;
    const status = getStatus(pct);
    return { ...shoe, currentMiles, pct, status, typeLabel: TYPE_LABELS[shoe.type] || shoe.type };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy)', marginBottom: '16px' }}>Shoe Fleet</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {shoeData.map((shoe, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '2px',
                }}>
                  {shoe.name}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--navy)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    padding: '0px 5px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {shoe.typeLabel}
                  </span>
                  <span style={{ fontSize: '10px', color: shoe.status.color, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                    {shoe.status.label}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '12px', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {shoe.currentMiles}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  /{shoe.retirementMiles}
                </span>
              </div>
            </div>
            <div style={{ height: '3px', background: 'var(--bg-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(shoe.pct * 100, 100)}%`,
                background: shoe.status.color,
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
