import React, { useState, useRef, useEffect } from 'react';

export default function ChatPanel({ chat }) {
  const { messages, loading, sendMessage } = chat;
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="chat-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">💬</span>
          HeadyBuddy AI
        </div>
        <div className="chat-badges">
          <span className="badge brain">Brain</span>
          <span className="badge hcfp">HCFP</span>
        </div>
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🧠'}
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="message-avatar">🧠</div>
            <div className="message-content typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask HeadyBuddy anything..."
        />
        <button className="chat-send" onClick={handleSend} disabled={loading}>
          ➤
        </button>
      </div>
    </div>
  );
}
