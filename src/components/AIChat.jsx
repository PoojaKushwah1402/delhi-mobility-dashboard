import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { isTransitQuery, buildSystemPrompt, REJECTION_MSG } from '../utils/ai-context';

export default function AIChat({ hexagons, selectedZone, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! Main Delhi Mobility AI hoon. Delhi NCR ke transit network, last-mile connectivity, aur e-rickshaw deployment ke baare mein kuch bhi poochiye. 🚇',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    // Frontend pre-filter
    if (!isTransitQuery(text)) {
      setMessages(prev => [...prev, { role: 'assistant', content: REJECTION_MSG }]);
      return;
    }

    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === 'sk-xxx') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'API key not configured. Please set VITE_ANTHROPIC_API_KEY in your .env file to enable AI responses.',
        }]);
        setLoading(false);
        return;
      }

      const systemPrompt = buildSystemPrompt(hexagons, selectedZone);
      const conversationHistory = [...messages.filter(m => m.role !== 'system'), userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.content?.[0]?.text || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}. Please check your API key and try again.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="panel panel-texture"
      style={{
        position: 'absolute',
        bottom: 56,
        right: 12,
        width: 380,
        height: 520,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
        animation: 'slideUp 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={14} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
              Delhi Mobility AI
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              borderRadius: 4,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} index={i} />
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Bot size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ display: 'flex', gap: 4 }}>
                <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: '150ms' }} />
                <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '0 12px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Delhi transit..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '10px 0',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 12,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                background: input.trim() ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: input.trim() ? 'pointer' : 'default',
                color: input.trim() ? '#08090d' : 'var(--text-dim)',
                transition: 'all 150ms',
              }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message, index }) {
  const isBot = message.role === 'assistant';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        animation: `slideUp 200ms cubic-bezier(0.32, 0.72, 0, 1) forwards`,
        animationDelay: `${index * 50}ms`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {isBot ? (
        <Bot size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
      ) : (
        <User size={14} color="var(--text-secondary)" style={{ marginTop: 2, flexShrink: 0 }} />
      )}
      <div
        style={{
          fontSize: 12,
          lineHeight: 1.5,
          color: isBot ? 'var(--text-primary)' : 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
