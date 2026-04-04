import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SCORE_ITEMS = [
  { color: '#ef4444', range: '0-20', label: 'Critical' },
  { color: '#f97316', range: '21-40', label: 'Poor' },
  { color: '#eab308', range: '41-60', label: 'Moderate' },
  { color: '#22c55e', range: '61-80', label: 'Good' },
  { color: '#06b6d4', range: '81-100', label: 'Excellent' },
];

export default function Legend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 160,
        right: 12,
        zIndex: 70,
        background: 'rgba(8, 9, 13, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: collapsed ? '6px 10px' : '10px 14px',
        width: collapsed ? 'auto' : 180,
        transition: 'all 200ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* Header — always visible, acts as toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}
        >
          {collapsed ? 'LEGEND' : 'CONNECTIVITY SCORE'}
        </span>
        {collapsed ? (
          <ChevronUp size={10} color="var(--text-dim)" />
        ) : (
          <ChevronDown size={10} color="var(--text-dim)" />
        )}
      </button>

      {/* Body — collapsible */}
      {!collapsed && (
        <div style={{ marginTop: 8 }}>
          {/* Score gradient items */}
          {SCORE_ITEMS.map((item) => (
            <div
              key={item.range}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: item.color,
                  opacity: 0.8,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--text-dim)',
                  width: 32,
                }}
              >
                {item.range}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {item.label}
              </span>
            </div>
          ))}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          {/* Map elements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#FFCB05',
                  border: '1.5px solid #fff',
                  flexShrink: 0,
                  marginLeft: 1,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                Metro Station
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#64748b',
                  flexShrink: 0,
                  marginLeft: 2.5,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                Bus Stop
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 6,
                  borderRadius: 1.5,
                  background: '#3b82f6',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                Live Bus
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
