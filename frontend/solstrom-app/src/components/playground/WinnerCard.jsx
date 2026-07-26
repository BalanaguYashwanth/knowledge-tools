import CollapsibleSection from '../common/CollapsibleSection';

function WinnerCard({ winner }) {
  return (
    <div className="chat-message__content">
      <h2>{winner.title}</h2>
      {winner.description && (
        <CollapsibleSection label="Description">
          <p style={{ whiteSpace: 'pre-wrap' }}>{winner.description}</p>
        </CollapsibleSection>
      )}
      {winner.repo_link && (
        <p className="chat-message__link">
          Repo link:
          <a href={winner.repo_link} target="_blank" rel="noopener noreferrer">
            {winner.repo_link}
          </a>
        </p>
      )}
    </div>
  );
}

export default WinnerCard;
