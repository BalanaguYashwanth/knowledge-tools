import IdeaCard from './IdeaCard';
import WinnerCard from './WinnerCard';

function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const hasEmptyIdeas =
    message.category === 'ideas' && Array.isArray(message.ideas) && message.ideas.length === 0;
  const hasEmptyWinners =
    message.category === 'hackathons' &&
    Array.isArray(message.winners) &&
    message.winners.length === 0;

  return (
    <div className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
      <div className="chat-message__meta">
        <span className="chat-message__role">{isUser ? 'You' : 'Assistant'}</span>
        {message.isDemo && <span className="chat-message__badge">Demo</span>}
        {message.category && (
          <span className="chat-message__badge chat-message__badge--route">
            {message.category}
          </span>
        )}
        {message.routedCollections?.length > 0 && (
          <span className="chat-message__badge chat-message__badge--route">
            {message.routedCollections.join(' + ')}
          </span>
        )}
      </div>

      {message.content && <p>{message.content}</p>}

      {(hasEmptyIdeas || hasEmptyWinners) && <p>No data found</p>}

      {message.ideas?.map((idea, index) => (
        <IdeaCard key={idea.id ?? idea.title ?? index} idea={idea} />
      ))}

      {message.winners?.map((winner, index) => (
        <WinnerCard key={winner.title ?? index} winner={winner} />
      ))}

      <MessageSummary category={message.category} summary={message.summary} />
    </div>
  );
}

function MessageSummary({ category, summary }) {
  if (!summary) return null;

  if (category === 'ideas' && summary?.ideas?.length > 0) {
    return (
      <div className="chat-message__sources">
        <span className="chat-message__sources-label">Summary</span>
        {summary.ideas.map((idea, index) => (
          <div key={idea.title ?? index}>
            <p>
              <strong>
                {idea.title
                  ? idea.title.charAt(0).toUpperCase() + idea.title.slice(1)
                  : ''}
              </strong>
            </p>
            <p>{idea.summary}</p>
          </div>
        ))}
      </div>
    );
  }

  if (category === 'hackathons' && Array.isArray(summary) && summary.length > 0) {
    return (
      <div className="chat-message__sources">
        <span className="chat-message__sources-label">Summary</span>
        {summary.map((item, index) => (
          <p key={index} style={{ whiteSpace: 'pre-wrap' }}>
            {item.content}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

export default ChatMessage;
