import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

function ChatPanel({ messages, isLoading, error, onSend, onClear }) {
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = inputRef.current?.value ?? '';
    if (!value.trim()) return;
    onSend(value);
    inputRef.current.value = '';
  };

  return (
    <section className="chat-panel" aria-label="RAG chat playground">
      <div className="chat-panel__header">
        <h2 className="chat-panel__title">Chat</h2>
        <button type="button" className="chat-panel__clear" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="chat-panel__messages" role="log" aria-live="polite">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="chat-panel__typing" aria-label="Assistant is typing">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="chat-panel__error">{error}</p>}

      <form className="chat-panel__input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chat-panel__input"
          placeholder="Ask about ideas, hackathon winners, or both..."
          disabled={isLoading}
          aria-label="Chat message"
        />
        <button
          type="submit"
          className="chat-panel__send"
          disabled={isLoading}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </section>
  );
}

export default ChatPanel;
