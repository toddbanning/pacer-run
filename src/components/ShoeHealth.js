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

export default function ShoeHealth({ shoes, gearMap }) {
  // gearMap: { [gear_id]: { id, name, distance (meters), ... } }
  // Build a lookup by shoe name from gearMap
  const gearByName = {};
  Object.values(gearMap).forEach(gear => {
    if (gear.name) {
      gearByName[gear.name] = gear;
    }
  });

  const shoeData = shoes.map(shoe => {
    const gear = gearByName[shoe.name];
    // Strava gear.distance is in meters — convert to miles for lifetime total
    const currentMiles = gear ? Math.round(metersToMiles(gear.distance)) : null;
    const pct = currentMiles !== null ? currentMiles / shoe.retirementMiles : 0;
    const status = getStatus(pct);
    return {
      ...shoe,
      currentMiles,
      pct,
      status,
      typeLabel: TYPE_LABELS[shoe.type] || shoe.type,
      hasData: currentMiles !== null,
    };
  }).sort((a, b) => b.pct - a.pct);

  const hasAnyData = shoeData.some(s => s.hasData);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow)',
      height: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--navy)' }}>Shoe Fleet</div>
        {hasAnyData && (
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            lifetime mi · strava
          </div>
        )}
      </div>

      {!hasAnyData ? (
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          Shoe data loading — ensure gear names in your config sheet match Strava exactly.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {shoeData.map((shoe, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
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
                    {shoe.hasData && (
                      <span style={{
                        fontSize: '10px',
                        color: shoe.status.color,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 500,
                      }}>
                        {shoe.status.label}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '12px', flexShrink: 0 }}>
                  {shoe.hasData ? (
                    <>
                      <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: shoe.status.color === '#2D7A4F' ? 'var(--text-primary)' : shoe.status.color, fontWeight: 500 }}>
                        {shoe.currentMiles}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        /{shoe.retirementMiles}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      —
                    </span>
                  )}
                </div>
              </div>

              {shoe.hasData && (
                <div style={{ height: '3px', background: 'var(--bg-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(shoe.pct * 100, 100)}%`,
                    background: shoe.status.color,
                    borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
