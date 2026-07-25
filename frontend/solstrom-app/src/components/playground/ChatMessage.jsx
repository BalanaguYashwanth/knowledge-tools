import IdeaCard from './IdeaCard';

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

      {message.content && <p>{message.content}</p>}

      {(message?.ideas && message.ideas?.length === 0) && (
        <p>No data found</p>
      )}

      {message.ideas?.map((idea, index) => (
        <IdeaCard key={idea.id ?? index} idea={idea} />
      ))}

      {message?.summary?.ideas?.length > 0 && (
        <div className="chat-message__sources">
          <span className="chat-message__sources-label">Summary</span>
          {message.summary.ideas.map((idea, index) => (
            <div key={idea.title ?? index}>
              <p>
                <strong>
                  {idea.title
                    ? idea.title.charAt(0).toUpperCase() + idea.title.slice(1)
                    : ''}
                </strong>
              </p>
              <p>Description: {idea.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
