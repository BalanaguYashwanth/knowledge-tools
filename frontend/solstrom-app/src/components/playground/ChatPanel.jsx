import { useEffect, useRef } from 'react';

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
      <div className="chat-message__meta">
        <span className="chat-message__role">{isUser ? 'You' : 'Assistant'}</span>
        {message.isDemo && <span className="chat-message__badge">Demo</span>}
        {message.routedCollections?.length > 0 && (
          <span className="chat-message__badge chat-message__badge--route">
            {message.routedCollections.join(' + ')}
          </span>
        )}
      </div>
      {message.content && <div className="chat-message__content">{formatContent(message.content)}</div>}
      {message.ideas && message.ideas.map((idea) => (
        <div className="chat-message__content" key={`idea-${idea.id}`}>
          <h1>{idea.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: idea.description }} />
          <p>{idea.problem}</p>
          <div dangerouslySetInnerHTML={{ __html: idea.solution }} />
          <p>{idea.resources}</p>
        </div>
      ))}
      {message?.summary && (
        <div className="chat-message__sources">
          <span className="chat-message__sources-label">Summary</span>
          <p>
            <strong>
              {message.summary.title
                ? message.summary.title.charAt(0).toUpperCase() + message.summary.title.slice(1)
                : ''}
            </strong>
          </p>
          <p> Description: {message.summary.description}</p>
        </div>
      )}
    </div>
  );
}

function formatContent(text) {
  if (!text) return null;

  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}

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
