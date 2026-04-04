import { useState, useEffect, useRef } from 'react';
import { Train, Bus, Route, AlertTriangle, Radio, Layers, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';

function AnimatedNumber({ value, duration = 600, delay = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const from = 0;
      const to = value;
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
        setDisplay(Math.round(from + (to - from) * eased));
        if (t < 1) ref.current = requestAnimationFrame(tick);
      }
      ref.current = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value, duration, delay]);

  return <>{display.toLocaleString()}</>;
}

const BRACKET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
const BRACKET_LABELS = ['0-20', '21-40', '41-60', '61-80', '81-100'];

const LAYER_ITEMS = [
  { key: 'hexagons', label: 'H3 Zones', icon: Layers },
  { key: 'metro', label: 'Metro Stations', icon: Train },
  { key: 'busStops', label: 'Bus Stops', icon: Bus },
  { key: 'liveBuses', label: 'Live Buses', icon: Radio },
  { key: 'gapOnly', label: 'Gap Zones Only', icon: AlertTriangle },
];

export default function StatsPanel({ stats, layers, onToggleLayer, lastBusUpdate }) {
  if (!stats) return null;

  const chartData = stats.brackets.map((count, i) => ({
    name: BRACKET_LABELS[i],
    value: count,
    color: BRACKET_COLORS[i],
  }));

  return (
    <div
      className="panel panel-texture"
      style={{
        position: 'absolute',
        top: 64,
        left: 12,
        width: 260,
        bottom: 56,
        padding: 16,
        zIndex: 80,
        overflow: 'auto',
        animation: 'slideInLeft 400ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Stats */}
        <StatBlock icon={Train} label="METRO STATIONS" value={stats.metroStations} delay={0} color="var(--accent)" />
        <StatBlock icon={Bus} label="BUS STOPS" value={stats.busStops} delay={100} color="var(--text-secondary)" />
        <StatBlock icon={Route} label="BUS ROUTES" value={stats.busRoutes} delay={200} color="var(--text-secondary)" />
        <StatBlock icon={AlertTriangle} label="LAST-MILE GAP ZONES" value={stats.gapZones} delay={300} color="var(--danger)" />

        {/* Distribution chart */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <span className="label">CONNECTIVITY DISTRIBUTION</span>
          <div style={{ height: 64, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {BRACKET_LABELS.map((label, i) => (
              <span key={i} style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Live buses */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: stats.liveBuses > 0 ? '#16a34a' : 'var(--text-dim)',
                boxShadow: stats.liveBuses > 0 ? '0 0 6px rgba(22,163,74,0.5)' : 'none',
              }}
            />
            <span className="label">LIVE BUSES</span>
          </div>
          <span className="stat-number" style={{ fontSize: 20 }}>
            {stats.liveBuses > 0 ? stats.liveBuses.toLocaleString() : '—'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 }}>active</span>
          {lastBusUpdate && (
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
              Updated: {lastBusUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Layer Toggles */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <span className="label">LAYER TOGGLES</span>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LAYER_ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onToggleLayer(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  background: layers[key] ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                  border: 'none',
                  borderLeft: `3px solid ${layers[key] ? 'var(--accent)' : 'transparent'}`,
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 150ms ease',
                }}
              >
                <Icon size={12} color={layers[key] ? 'var(--accent)' : 'var(--text-dim)'} />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-heading)',
                    color: layers[key] ? 'var(--text-primary)' : 'var(--text-secondary)',
                    flex: 1,
                  }}
                >
                  {label}
                </span>
                {layers[key] ? (
                  <Eye size={11} color="var(--text-dim)" />
                ) : (
                  <EyeOff size={11} color="var(--text-dim)" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value, delay, color }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Icon size={12} color={color || 'var(--text-dim)'} />
        <span className="label">{label}</span>
      </div>
      <span className="stat-number" style={{ fontSize: 24 }}>
        <AnimatedNumber value={value} delay={delay} />
      </span>
    </div>
  );
}
