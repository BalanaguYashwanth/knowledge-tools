import CollapsibleSection from '../common/CollapsibleSection';

function IdeaCard({ idea }) {
  return (
    <div className="chat-message__content">
      <h2>{idea.title}</h2>
      {idea.problem && <p>{idea.problem}</p>}
      <CollapsibleSection label="Description" html={idea.description} />
      <CollapsibleSection label="Possible Solution" html={idea.solution} />
      {idea.resources && (
        <CollapsibleSection label="Resources">
          <p style={{ whiteSpace: 'pre-wrap' }}>{idea.resources}</p>
        </CollapsibleSection>
      )}
    </div>
  );
}

export default IdeaCard;
