import { X, Train, Bus, Route, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { getScoreColor, getScoreBracket } from '../utils/h3-utils';

export default function ZoneDetail({ zone, onClose, onAskAI }) {
  const scoreColor = getScoreColor(zone.score);
  const bracket = getScoreBracket(zone.score);

  return (
    <div
      className="panel panel-texture"
      style={{
        position: 'absolute',
        top: 64,
        right: 12,
        width: 320,
        bottom: 56,
        padding: 0,
        zIndex: 80,
        overflow: 'auto',
        animation: 'slideInRight 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <span className="label">ZONE ANALYSIS</span>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
                marginTop: 2,
              }}
            >
              {zone.id.slice(0, 15)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'color 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <X size={14} />
          </button>
        </div>

        {/* Score */}
        <div style={{ padding: '16px' }}>
          <span className="label">CONNECTIVITY SCORE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span
              className="stat-number"
              style={{ fontSize: 32, color: scoreColor }}
            >
              {zone.score}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-dim)' }}>/100</span>
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 4,
              background: 'var(--bg-elevated)',
              borderRadius: 2,
              marginTop: 8,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${zone.score}%`,
                height: '100%',
                background: `linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4)`,
                backgroundSize: '400% 100%',
                backgroundPosition: `${100 - zone.score}% 0`,
                borderRadius: 2,
                transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-heading)',
              color: scoreColor,
              fontWeight: 500,
              marginTop: 4,
              display: 'block',
            }}
          >
            {bracket}
          </span>
        </div>

        {/* Gap Zone Alert */}
        {zone.isGapZone && (
          <div
            style={{
              margin: '0 16px 16px',
              padding: '10px 12px',
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderLeft: '3px solid var(--danger)',
              borderRadius: '0 4px 4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={14} color="var(--danger)" />
            <span style={{ fontSize: 11, fontWeight: 500, color: '#ef4444' }}>
              {zone.score <= 20 ? 'CRITICAL GAP ZONE — NO TRANSIT' : zone.score <= 35 ? 'SEVERE GAP ZONE' : 'GAP ZONE — POOR CONNECTIVITY'}
            </span>
          </div>
        )}

        {/* Breakdown */}
        <div style={{ padding: '0 16px 16px' }}>
          <span className="label">BREAKDOWN</span>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <DetailRow
              icon={Train}
              label="Metro Stations"
              value={zone.metroCount}
              color="var(--accent)"
            >
              {zone.metroStations?.map((s, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    paddingLeft: 20,
                    marginTop: 2,
                    borderLeft: `2px solid ${s.color || 'var(--border)'}`,
                    marginLeft: 6,
                    paddingTop: 1,
                    paddingBottom: 1,
                  }}
                >
                  {s.stop_name}
                  <span style={{ color: 'var(--text-dim)', marginLeft: 4, fontSize: 10 }}>
                    {s.lines?.join(', ')}
                  </span>
                </div>
              ))}
            </DetailRow>
            <DetailRow icon={Bus} label="Bus Stops" value={zone.busStopCount} color="var(--text-secondary)" />
            <DetailRow icon={Route} label="Bus Routes" value={zone.busRouteCount} color="var(--text-secondary)" />
            <DetailRow icon={Clock} label="Avg Frequency" value={`${zone.avgFrequency} trips/day`} color="var(--text-secondary)" />
          </div>
        </div>

        {/* AI Recommendation Button */}
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={onAskAI}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: 4,
              cursor: 'pointer',
              color: 'var(--accent)',
              fontFamily: 'var(--font-heading)',
              fontSize: 12,
              fontWeight: 500,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.14)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)';
            }}
          >
            Ask AI about this zone
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, color, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
        <span className="stat-number" style={{ fontSize: 14 }}>
          {typeof value === 'number' ? value : value}
        </span>
      </div>
      {children}
    </div>
  );
}
