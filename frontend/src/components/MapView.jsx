import React, { useRef, useEffect, useState } from 'react';

const MAP_W = 780;
const MAP_H = 560;

// Approximate India landmass outline for SVG background (simplified polygon)
const INDIA_PATH = "M 165,60 L 200,55 L 250,62 L 310,58 L 370,65 L 430,72 L 490,85 L 545,100 L 580,130 L 600,165 L 595,210 L 610,250 L 600,295 L 575,330 L 555,360 L 530,385 L 505,400 L 490,430 L 460,460 L 430,490 L 400,510 L 370,520 L 340,515 L 310,505 L 280,490 L 255,470 L 235,445 L 215,420 L 200,395 L 185,365 L 168,340 L 145,310 L 130,280 L 120,250 L 118,220 L 125,195 L 130,165 L 140,135 L 150,100 Z";

export default function MapView({ buildings, edges, route, selected }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 380, h: 300 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Build route edge lookup
  const routeEdgeSet = new Set();
  if (route?.path) {
    for (let i = 0; i < route.path.length - 1; i++) {
      routeEdgeSet.add(`${route.path[i]}|${route.path[i + 1]}`);
      routeEdgeSet.add(`${route.path[i + 1]}|${route.path[i]}`);
    }
  }
  const routeNodeSet = new Set(route?.path || []);

  const getBuilding = (id) => buildings.find(b => b.id === id);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#B8D4E8', position: 'relative', overflow: 'hidden' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="rgba(0,52,153,0.25)" />
          </filter>
          <style>{`
            @keyframes dashMove { to { stroke-dashoffset: -24; } }
            .route-anim { stroke-dasharray: 8 8; animation: dashMove 0.5s linear infinite; }
          `}</style>
        </defs>

        {/* Ocean background */}
        <rect width={MAP_W} height={MAP_H} fill="#B8D4E8" />
        {/* India landmass */}
        <path d={INDIA_PATH} fill="#E8D5A3" stroke="#C4A96A" strokeWidth="2" opacity="0.85" />
        <path d={INDIA_PATH} fill="#F0E0B0" stroke="none" opacity="0.4" />
        {/* Region labels */}
        <text x="200" y="120" textAnchor="middle" fontSize="9" fill="#9B7D4A" fontWeight="600" fontFamily="Space Grotesk, sans-serif" opacity="0.7">NORTH</text>
        <text x="510" y="300" textAnchor="middle" fontSize="9" fill="#9B7D4A" fontWeight="600" fontFamily="Space Grotesk, sans-serif" opacity="0.7">EAST</text>
        <text x="148" y="370" textAnchor="middle" fontSize="9" fill="#9B7D4A" fontWeight="600" fontFamily="Space Grotesk, sans-serif" opacity="0.7">WEST</text>
        <text x="280" y="512" textAnchor="middle" fontSize="9" fill="#9B7D4A" fontWeight="600" fontFamily="Space Grotesk, sans-serif" opacity="0.7">SOUTH</text>

        {/* ── Edges ── */}
        {edges.map((edge, i) => {
          const f = getBuilding(edge.from);
          const t = getBuilding(edge.to);
          if (!f || !t) return null;
          const isRoute = routeEdgeSet.has(`${edge.from}|${edge.to}`);
          const mx = (f.x + t.x) / 2;
          const my = (f.y + t.y) / 2;
          return (
            <g key={i}>
              {/* Base path line */}
              <line
                x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                stroke={isRoute ? '#FF6B35' : '#90A4AE'}
                strokeWidth={isRoute ? 5 : 2}
                strokeLinecap="round"
                opacity={isRoute ? 1 : 0.55}
                filter={isRoute ? 'url(#routeGlow)' : undefined}
              />
              {/* Animated overlay on route */}
              {isRoute && (
                <line
                  x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  className="route-anim"
                />
              )}
              {/* Weight label on route edges */}
              {isRoute && (
                <g>
                  <rect x={mx - 22} y={my - 11} width={44} height={16} rx={4} fill="white" opacity={0.9} />
                  <text x={mx} y={my + 3} textAnchor="middle" fontSize="10" fontWeight="700" fill="#FF6B35" fontFamily="Space Grotesk, sans-serif">
                    {edge.weight}km
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Nodes (Buildings) ── */}
        {buildings.map((b) => {
          const isFrom    = selected.from === b.id;
          const isTo      = selected.to === b.id;
          const inRoute   = routeNodeSet.has(b.id);
          const routeIdx  = route?.path ? route.path.indexOf(b.id) : -1;

          let fill   = '#FFFFFF';
          let stroke = '#90A4AE';
          let sw     = 2;

          if (isFrom)                      { fill = '#0052CC'; stroke = '#003a99'; sw = 3; }
          else if (isTo)                   { fill = '#FF6B35'; stroke = '#CC4A1A'; sw = 3; }
          else if (inRoute)                { fill = '#FFF3EC'; stroke = '#FF6B35'; sw = 2.5; }

          const nameShort = b.name.length > 13 ? b.name.slice(0, 12) + '…' : b.name;

          return (
            <g key={b.id} filter="url(#nodeShadow)">
              {/* Node circle */}
              <circle
                cx={b.x} cy={b.y} r={22}
                fill={fill}
                stroke={stroke}
                strokeWidth={sw}
              />
              {/* Building icon */}
              <text
                x={b.x} y={b.y + 7}
                textAnchor="middle"
                fontSize="17"
              >
                {b.icon}
              </text>
              {/* Name label */}
              <text
                x={b.x} y={b.y + 37}
                textAnchor="middle"
                fontSize="9"
                fontWeight={inRoute ? '700' : '600'}
                fill={isFrom ? '#0052CC' : isTo ? '#CC4A1A' : '#344563'}
                fontFamily="Space Grotesk, sans-serif"
              >
                {nameShort}
              </text>
              {/* City name */}
              <text
                x={b.x} y={b.y + 47}
                textAnchor="middle"
                fontSize="7.5"
                fill="#7A6040"
                fontFamily="Space Grotesk, sans-serif"
                opacity="0.8"
              >
                {b.city}
              </text>

              {/* Route step badge */}
              {routeIdx >= 0 && (
                <>
                  <circle
                    cx={b.x + 15} cy={b.y - 15} r={10}
                    fill={routeIdx === 0 ? '#0052CC' : routeIdx === (route.path.length - 1) ? '#FF6B35' : '#FF6B35'}
                    stroke="white" strokeWidth={2}
                  />
                  <text
                    x={b.x + 15} y={b.y - 11}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="white"
                    fontFamily="Space Grotesk, sans-serif"
                  >
                    {routeIdx + 1}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* ── Legend ── */}
        <g transform="translate(10, 10)">
          <rect x="0" y="0" width="126" height="80" rx="10" fill="white" opacity="0.92" />
          <circle cx="16" cy="20" r="8" fill="#0052CC" />
          <text x="30" y="24" fontSize="10" fontFamily="Space Grotesk, sans-serif" fill="#344563" fontWeight="500">Start Point</text>
          <circle cx="16" cy="42" r="8" fill="#FF6B35" />
          <text x="30" y="46" fontSize="10" fontFamily="Space Grotesk, sans-serif" fill="#344563" fontWeight="500">Destination</text>
          <line x1="7" y1="64" x2="25" y2="64" stroke="#FF6B35" strokeWidth="3.5" strokeLinecap="round" />
          <text x="30" y="68" fontSize="10" fontFamily="Space Grotesk, sans-serif" fill="#344563" fontWeight="500">Shortest Path</text>
        </g>
      </svg>
    </div>
  );
}
