import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

export default function LiveTracker({ count, lastUpdate, isSimulated = true }) {
  const [timeAgo, setTimeAgo] = useState('connecting...');

  useEffect(() => {
    if (!lastUpdate) return;
    const tick = () => {
      const sec = Math.round((Date.now() - lastUpdate.getTime()) / 1000);
      setTimeAgo(sec < 2 ? 'just now' : `${sec}s ago`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdate]);

  const dotColor = isSimulated ? '#f59e0b' : '#16a34a';
  const dotShadow = isSimulated ? '0 0 6px rgba(245, 158, 11, 0.5)' : '0 0 6px rgba(22, 163, 74, 0.5)';
  const statusLabel = isSimulated ? 'SIMULATED' : 'LIVE';
  const statusColor = isSimulated ? '#f59e0b' : '#16a34a';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 16,
        background: 'rgba(15, 17, 23, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)',
        zIndex: 90,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: count > 0 ? dotColor : 'var(--text-dim)',
            boxShadow: count > 0 ? dotShadow : 'none',
            animation: count > 0 ? 'gapPulse 2.5s ease-in-out infinite' : 'none',
          }}
        />
        <span className="label" style={{ fontSize: 10, color: statusColor }}>{statusLabel}</span>
      </div>
      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Radio size={12} color="var(--text-dim)" />
        <span className="stat-number" style={{ fontSize: 13 }}>
          {count > 0 ? count.toLocaleString() : '—'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          buses active
        </span>
      </div>
      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
        Updated: {timeAgo}
      </span>
    </div>
  );
}
