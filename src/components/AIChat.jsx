import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { isTransitQuery, buildSystemPrompt, REJECTION_MSG } from '../utils/ai-context';
import { findCacheMatch, cacheAnswer } from '../utils/ai-cache';

export default function AIChat({ hexagons, selectedZone, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Delhi Mobility AI — Ask me about transit connectivity, gap zones, e-rickshaw deployment, or any zone analysis. I support English and Hindi.',
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

    // Check cache first
    const cached = findCacheMatch(text);
    if (cached) {
      setMessages(prev => [...prev, { role: 'assistant', content: cached }]);
      return;
    }

    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'AI API key not configured. Please set VITE_GEMINI_API_KEY in your .env file.',
        }]);
        setLoading(false);
        return;
      }

      const systemPrompt = buildSystemPrompt(hexagons, selectedZone);

      // Build conversation for Gemini
      const contents = [];
      const history = [...messages.filter(m => m.role !== 'system'), userMsg];
      for (const msg of history) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }

      const requestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
      };

      // Try models in order, with one retry on 429/503
      const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-001', 'gemini-flash-latest'];

      async function callGemini(model) {
        return fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );
      }

      let response = null;
      let lastError = null;
      let showedRetryMsg = false;

      outer: for (const model of MODELS) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            response = await callGemini(model);
            if (response.ok) break outer;

            if (response.status === 429 || response.status === 503) {
              if (!showedRetryMsg && attempt === 0) {
                showedRetryMsg = true;
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: 'High demand, retrying...',
                  _temporary: true,
                }]);
              }
              await new Promise(r => setTimeout(r, 2000));
              continue;
            }

            const errData = await response.json().catch(() => ({}));
            lastError = new Error(errData.error?.message || `API error: ${response.status}`);
            break;
          } catch (err) {
            lastError = err;
            break;
          }
        }
      }

      // Remove temporary "retrying" message
      setMessages(prev => prev.filter(m => !m._temporary));

      if (!response || !response.ok) {
        throw lastError || new Error('All models failed');
      }

      const data = await response.json();
      const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      // Cache the response
      cacheAnswer(text, assistantContent);

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
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
          {messages.length === 1 && !loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {[
                'Which zones have the worst connectivity?',
                'Where should I deploy e-rickshaws first?',
                'Analyze the Dwarka corridor',
                'Top 10 underserved metro stations',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  style={{
                    padding: '5px 10px',
                    background: 'rgba(6, 182, 212, 0.06)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    borderRadius: 4,
                    color: 'var(--accent)',
                    fontSize: 10,
                    fontFamily: 'var(--font-heading)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.12)'; e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)'; e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.15)'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
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
              placeholder="Ask about Delhi's transit network (English or Hindi)"
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
