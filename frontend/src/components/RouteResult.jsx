import React from 'react';

function fmtDist(m)  { return m >= 1000 ? `${(m/1000).toFixed(2)} km` : `${m} m`; }
function fmtTime(s)  {
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return m > 0 ? `${m} min ${sec}s` : `${sec}s`;
}

// OSRM maneuver type → readable label
const MANEUVER = {
  turn:          '↩️ Turn',
  'new name':    '➡️ Continue',
  depart:        '🚶 Start',
  arrive:        '🏁 Arrive',
  merge:         '↗️ Merge',
  roundabout:    '🔄 Roundabout',
  rotary:        '🔄 Rotary',
  fork:          '⑂  Fork',
  'on ramp':     '↗️ On ramp',
  'off ramp':    '↘️ Off ramp',
};

export default function RouteResult({ route, onReset, onStreetView }) {
  if (!route) return null;

  const steps = route.steps.filter(s => s.name || s.maneuver?.type);

  return (
    <div className="fade-up">
      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { icon: '📏', label: 'Distance',  value: fmtDist(route.distance) },
          { icon: '🚶', label: 'Walk Time', value: fmtTime(route.duration) },
          { icon: '↩️', label: 'Turns',     value: `${steps.length} steps` }
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Badges ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className="badge badge-blue">🧮 Dijkstra's Algorithm</span>
        <span className="badge badge-green">✅ Real OSM Route</span>
      </div>

      {/* ── From → To card ── */}
      <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>FROM</p>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{route.from.icon} {route.from.name}</p>
          </div>
          <div style={{ fontSize: 22, color: 'var(--primary)' }}>→</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>TO</p>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{route.to.icon} {route.to.name}</p>
          </div>
        </div>
      </div>

      {/* ── Street View buttons ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => onStreetView(route.from.lat, route.from.lng)}
          style={{ flex: 1, padding: '10px', background: '#EBF5FF', border: '1.5px solid #BFDBFE', borderRadius: 10, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 12, color: '#1D4ED8' }}
        >
          🔭 Street View (Start)
        </button>
        <button
          onClick={() => onStreetView(route.to.lat, route.to.lng)}
          style={{ flex: 1, padding: '10px', background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 10, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 12, color: '#C2410C' }}
        >
          🔭 Street View (End)
        </button>
      </div>

      {/* ── Turn-by-turn ── */}
      {steps.length > 0 && (
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Turn-by-Turn Directions
          </p>
          {steps.slice(0, 10).map((step, i) => {
            const manLabel = MANEUVER[step.maneuver?.type] || '➡️ Go';
            const isFirst  = i === 0;
            const isLast   = i === steps.length - 1 || step.maneuver?.type === 'arrive';
            return (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: isFirst ? 'var(--primary)' : isLast ? 'var(--accent)' : 'var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: (isFirst || isLast) ? 'white' : 'var(--text-muted)' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{manLabel}</p>
                  <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                    {step.name || 'Unnamed path'}
                  </p>
                  {step.distance > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {fmtDist(Math.round(step.distance))} · {fmtTime(Math.round(step.duration))}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {steps.length > 10 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
              +{steps.length - 10} more steps
            </p>
          )}
        </div>
      )}

      <button className="btn btn-outline" onClick={onReset}>🔄 Find Another Route</button>
    </div>
  );
}
