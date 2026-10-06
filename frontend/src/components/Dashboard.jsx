import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { colleges } from '../data/colleges';
import LeafletMap from './LeafletMap';

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

// ── Maneuver arrow icons (text-based, no emojis) ─────────────────────────────
const MANEUVER_ICON = {
  depart:        '↑',
  arrive:        '●',
  continue:      '↑',
  turn:          null,   // resolved by modifier
  uturn:         '↺',
  roundabout:    '⟳',
};
const MODIFIER_ICON = {
  'straight':    '↑',
  'slight right':'↗',
  'right':       '→',
  'sharp right': '↪',
  'slight left': '↖',
  'left':        '←',
  'sharp left':  '↩',
  'uturn':       '↺',
};
function stepIcon(step) {
  if (step.modifier && MODIFIER_ICON[step.modifier]) return MODIFIER_ICON[step.modifier];
  return MANEUVER_ICON[step.type] || '↑';
}

// ── Search autocomplete field ─────────────────────────────────────────────────
function SearchField({ icon, color, placeholder, buildings, selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);

  const suggestions = query.trim()
    ? buildings.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
    : buildings;

  const pick = (b) => { onSelect(b); setQuery(b.name); setOpen(false); };
  const clear = (e) => { e.stopPropagation(); onSelect(null); setQuery(''); };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {/* Suggestions — float above input */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, right: 0, zIndex: 9999,
          background: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB',
          boxShadow: '0 -8px 28px rgba(0,0,0,0.12)', maxHeight: 210, overflowY: 'auto'
        }}>
          {suggestions.map((b, i) => (
            <button key={b.id} onMouseDown={() => pick(b)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px', border: 'none',
              background: 'none', cursor: 'pointer', textAlign: 'left',
              fontFamily: FONT, borderBottom: i < suggestions.length-1 ? '1px solid #F3F4F6' : 'none'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{b.name}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#F9FAFB', borderRadius: 10, padding: '11px 14px',
        border: `2px solid ${open ? color : 'transparent'}`, transition: 'border-color 0.15s'
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <input
          type="text"
          value={open ? query : (selected?.name || '')}
          placeholder={placeholder}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setQuery(selected?.name || ''); }}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          style={{
            flex: 1, border: 'none', background: 'none', outline: 'none',
            fontFamily: FONT, fontSize: 14,
            color: '#111827', fontWeight: selected && !open ? 600 : 400
          }}
        />
        {selected && (
          <button onMouseDown={clear} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:13, padding:0 }}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDist = (m) => m >= 1000 ? `${(m/1000).toFixed(2)} km` : `${m} m`;
const fmtTime = (s) => { const m = Math.floor(s/60); return m>0 ? `${m} min ${s%60>0?s%60+'s':''}`.trim() : `${s}s`; };

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({ user, setUser }) {
  const [college, setCollege]   = useState(null);
  const [fromB,   setFromB]     = useState(null);
  const [toB,     setToB]       = useState(null);
  const [route,   setRoute]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');
  const [showDir, setShowDir]   = useState(false);
  const [wifiAPs, setWifiAPs]   = useState([]);

  const buildings = college?.buildings || [];

  // Auto-fetch when both endpoints change
  useEffect(() => {
    if (fromB && toB && fromB.id !== toB.id) fetchRoute();
    if (!fromB || !toB) { setRoute(null); setShowDir(false); }
  }, [fromB?.id, toB?.id]); // eslint-disable-line

  const fetchRoute = async () => {
    setError(''); setLoading(true); setShowDir(false);
    try {
      const res = await axios.post('/api/nav/route', {
        college: college.id, from: fromB.id, to: toB.id
      });
      
      let routeData = res.data;
      if (routeData.wifi?.length) setWifiAPs(routeData.wifi);

      // Snapping the Dijkstra route to OSM pedestrian roads!
      try {
        const waypoints = routeData.pathDetails.map(b => `${b.lng},${b.lat}`).join(';');
        // routing.openstreetmap.de has superior footway data
        const osrmRes = await axios.get(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${waypoints}?geometries=geojson&overview=full`);
        if (osrmRes.data.routes && osrmRes.data.routes[0]) {
          routeData.osrmGeometry = osrmRes.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        }
      } catch (e) {
        // Fallback to project-osrm
        try {
          const waypoints = routeData.pathDetails.map(b => `${b.lng},${b.lat}`).join(';');
          const osrmRes = await axios.get(`https://router.project-osrm.org/route/v1/foot/${waypoints}?geometries=geojson&overview=full`);
          if (osrmRes.data.routes && osrmRes.data.routes[0]) {
            routeData.osrmGeometry = osrmRes.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          }
        } catch(e2) {
          console.warn('OSRM road snap failed, falling back to dotted lines');
        }
      }

      // Check for drinking water along the path
      const waterKeywords = ['canteen', 'hostel', 'hall', 'library', 'sac', 'gymkhana', 'hospital', 'mess', 'market'];
      const waterNode = routeData.pathDetails.find(b => b && b.name && waterKeywords.some(k => b.name.toLowerCase().includes(k)));
      routeData.waterAvailable = waterNode ? waterNode.name : null;

      setRoute(routeData);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to calculate route');
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try { await axios.post('/api/auth/logout'); } catch (_) {}
    setUser(null);
  };

  // ── College Picker ───────────────────────────────────────────────────────────
  if (!college) {
    return (
      <div style={{ minHeight:'100vh', background:'#fff', fontFamily:FONT }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#0040A8,#0066FF)', padding:'24px 16px 32px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h1 style={{ color:'#fff', fontSize:22, fontWeight:800, letterSpacing:'-0.4px' }}>CampusNav</h1>
              <p style={{ color:'rgba(255,255,255,0.72)', fontSize:13, marginTop:2 }}>
                Hello, {user.name.split(' ')[0]}
              </p>
            </div>
            <button onClick={handleLogout} style={{ background:'rgba(255,255,255,0.14)', border:'none', color:'#fff', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontFamily:FONT, fontSize:13, fontWeight:600 }}>
              Sign out
            </button>
          </div>
          <p style={{ color:'rgba(255,255,255,0.9)', fontSize:14, marginTop:20, fontWeight:500 }}>
            Select your campus to start navigating
          </p>
        </div>

        {/* Campus list */}
        <div style={{ padding:'20px 16px' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:14 }}>
            Available Campuses
          </p>
          {colleges.map(c => (
            <button key={c.id} onClick={() => setCollege(c)} style={{
              display:'flex', alignItems:'center', gap:14,
              background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:14,
              padding:'14px 16px', cursor:'pointer', textAlign:'left',
              width:'100%', fontFamily:FONT, marginBottom:10, transition:'all 0.18s'
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor='#0052CC'; e.currentTarget.style.background='#F0F4FF'; }}
              onMouseOut={e =>  { e.currentTarget.style.borderColor='#E5E7EB';  e.currentTarget.style.background='#fff'; }}>
              <div style={{ width:46, height:46, borderRadius:12, background:'#EEF3FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#0052CC', flexShrink:0 }}>
                {c.name.split(' ').map(w=>w[0]).join('').slice(0,3)}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:15, color:'#111827', marginBottom:3 }}>{c.name}</p>
                <p style={{ fontSize:12, color:'#6B7280' }}>{c.city}  ·  {c.buildings.length} locations</p>
              </div>
              <span style={{ color:'#D1D5DB', fontSize:20 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Navigation Screen ────────────────────────────────────────────────────────
  const hasRoute = !!route && !loading;
  const waterKeywords = ['canteen', 'hostel', 'hall', 'library', 'sac', 'gymkhana', 'hospital', 'mess', 'market', 'nescafe'];
  const waterNodes = buildings.filter(b => b && b.name && waterKeywords.some(k => b.name.toLowerCase().includes(k)));

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', fontFamily:FONT }}>
      {/* Top bar */}
      <div style={{ background:'#fff', padding:'9px 14px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', zIndex:1000, flexShrink:0 }}>
        <button onClick={() => { setCollege(null); setFromB(null); setToB(null); setRoute(null); setShowDir(false); }}
          style={{ background:'#F3F4F6', border:'none', width:34, height:34, borderRadius:8, cursor:'pointer', fontSize:17, display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
          ←
        </button>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700, fontSize:14, color:'#111827', lineHeight:1.2 }}>{college.name}</p>
          <p style={{ fontSize:11, color:'#6B7280' }}>{college.city}</p>
        </div>
        <button onClick={handleLogout} style={{ background:'none', border:'none', color:'#9CA3AF', fontSize:13, cursor:'pointer', fontFamily:FONT, fontWeight:600 }}>
          Sign out
        </button>
      </div>

      {/* Full-screen Leaflet Map */}
      <div style={{ flex:1, minHeight:0, zIndex:1 }}>
        <LeafletMap
          college={college}
          buildings={buildings}
          route={route}
          selected={{ from: fromB?.id, to: toB?.id }}
          wifiAPs={wifiAPs}
          waterNodes={waterNodes}
        />
      </div>

      {/* ── Bottom panel (Ola-style) ── */}
      <div style={{
        background:'#fff', borderRadius:'20px 20px 0 0',
        boxShadow:'0 -4px 24px rgba(0,0,0,0.1)',
        padding:'14px 16px 28px', zIndex:1000, flexShrink:0
      }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
          <div style={{ width:36, height:4, background:'#E5E7EB', borderRadius:2 }} />
        </div>

        {/* Search row */}
        <div style={{ display:'flex', alignItems:'stretch', gap:10 }}>
          {/* Connector dots */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:13, paddingBottom:13, flexShrink:0 }}>
            <div style={{ width:11, height:11, borderRadius:'50%', background:'#0052CC', boxShadow:'0 0 0 3px rgba(0,82,204,0.15)' }} />
            <div style={{ width:2, flex:1, background:'#E5E7EB', margin:'5px 0' }} />
            <div style={{ width:11, height:11, borderRadius:3, background:'#FF6B35', boxShadow:'0 0 0 3px rgba(255,107,53,0.15)' }} />
          </div>

          {/* Fields */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
            <SearchField
              color="#0052CC"
              placeholder="Your location..."
              buildings={buildings}
              selected={fromB}
              onSelect={b => { setFromB(b); if (b && toB?.id === b?.id) setToB(null); }}
            />
            <SearchField
              color="#FF6B35"
              placeholder="Where to?"
              buildings={buildings}
              selected={toB}
              onSelect={b => { setToB(b); if (b && fromB?.id === b?.id) setFromB(null); }}
            />
          </div>

          {/* Swap */}
          <div style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
            <button onClick={() => { const t=fromB; setFromB(toB); setToB(t); setRoute(null); setShowDir(false); }}
              style={{ background:'#F9FAFB', border:'1.5px solid #E5E7EB', width:36, height:36, borderRadius:'50%', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' }}>
              ⇅
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <p style={{ color:'#DC2626', fontSize:13, fontWeight:500, marginTop:10 }}>{error}</p>}

        {/* Loading */}
        {loading && (
          <div style={{ display:'flex', alignItems:'center', gap:12, background:'#F9FAFB', borderRadius:12, padding:'13px 16px', marginTop:14 }}>
            <div className="spinner" style={{ width:18, height:18, borderWidth:2 }} />
            <p style={{ fontSize:14, color:'#6B7280', fontWeight:500 }}>Finding shortest path...</p>
          </div>
        )}

        {/* ETA card */}
        {hasRoute && (
          <div style={{ background:'#EFF6FF', borderRadius:14, padding:'14px 18px', marginTop:14, border:'1.5px solid #BFDBFE' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                <div>
                  <p style={{ fontSize:26, fontWeight:800, color:'#0052CC', lineHeight:1, letterSpacing:'-0.5px' }}>
                    {route.durationText}
                  </p>
                  <p style={{ fontSize:12, color:'#6B7280', marginTop:3 }}>walk time</p>
                </div>
                <div style={{ width:1, height:36, background:'#BFDBFE' }} />
                <div>
                  <p style={{ fontSize:18, fontWeight:700, color:'#111827', lineHeight:1 }}>
                    {route.distanceText}
                  </p>
                  <p style={{ fontSize:12, color:'#6B7280', marginTop:3 }}>shortest distance</p>
                </div>
              </div>
              
              {/* Drinking water badge */}
              <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: route.waterAvailable ? '#D1FAE5' : '#FEE2E2', color: route.waterAvailable ? '#047857' : '#B91C1C', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                💧 {route.waterAvailable ? `Water at ${route.waterAvailable}` : 'No water along route'}
              </div>
              <button
                onClick={() => setShowDir(s => !s)}
                style={{ background: showDir ? '#0052CC' : '#DBEAFE', color: showDir ? '#fff' : '#1D4ED8', border:'none', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontFamily:FONT, fontWeight:700, fontSize:12, transition:'all 0.18s' }}
              >
                {showDir ? 'Hide' : 'Directions'}
              </button>
            </div>

            {/* Turn-by-turn directions */}
            {showDir && route.steps?.length > 0 && (
              <div style={{ marginTop:14, borderTop:'1.5px solid #BFDBFE', paddingTop:12 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:10 }}>
                  Turn-by-Turn Directions
                </p>
                {route.steps.map((step, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:i<route.steps.length-1?10:0 }}>
                    {/* Step number + icon */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                      <div style={{
                        width:28, height:28, borderRadius:'50%', flexShrink:0,
                        background: i===0 ? '#0052CC' : i===route.steps.length-1 ? '#FF6B35' : '#F3F4F6',
                        color: (i===0||i===route.steps.length-1) ? '#fff' : '#374151',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:14, fontWeight:700
                      }}>
                        {stepIcon(step)}
                      </div>
                      {i < route.steps.length-1 && (
                        <div style={{ width:1, height:14, background:'#BFDBFE', margin:'3px 0' }} />
                      )}
                    </div>
                    {/* Text */}
                    <div style={{ flex:1, paddingBottom: i<route.steps.length-1?0:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'#111827', lineHeight:1.4 }}>
                        {step.instruction}
                      </p>
                      {step.toward && (
                        <p style={{ fontSize:11, color:'#6B7280', marginTop:1 }}>toward {step.toward}</p>
                      )}
                      {step.distance > 0 && (
                        <p style={{ fontSize:11, color:'#0052CC', fontWeight:600, marginTop:2 }}>
                          {step.distanceText}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Algo info */}
        {hasRoute && (
          <p style={{ textAlign:'center', fontSize:11, color:'#9CA3AF', marginTop:10, fontWeight:500 }}>
            Shortest path via Dijkstra  ·  Speed: 1.4 m/s (OSRM standard walking)
          </p>
        )}

        {!fromB && !toB && !loading && (
          <p style={{ textAlign:'center', fontSize:13, color:'#9CA3AF', marginTop:14, fontWeight:500 }}>
            Search for your start and destination above
          </p>
        )}
      </div>
    </div>
  );
}
