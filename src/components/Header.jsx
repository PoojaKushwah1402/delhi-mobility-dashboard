import { Hexagon, MessageSquare, Info } from 'lucide-react';

export default function Header({ onChatToggle, chatOpen }) {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(8, 9, 13, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Hexagon size={18} color="var(--accent)" strokeWidth={2.5} />
        <div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Delhi Mobility Intelligence
          </span>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 10,
              color: 'var(--text-dim)',
              marginLeft: 12,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Powered by Delhi Open Transit Data + Macro Rides
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={onChatToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: chatOpen ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${chatOpen ? 'var(--border-active)' : 'var(--border)'}`,
            borderRadius: 4,
            color: chatOpen ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.02em',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-active)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            if (!chatOpen) {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <MessageSquare size={13} />
          AI Chat
        </button>
      </div>
    </header>
  );
}
