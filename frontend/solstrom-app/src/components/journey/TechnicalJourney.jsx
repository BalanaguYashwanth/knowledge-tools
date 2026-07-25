import { JOURNEY_STEPS, TECH_STACK } from '../../constants/journeyContent';
import JourneyStep from './JourneyStep';
import WorkflowDiagram from './WorkflowDiagram';

function TechnicalJourney() {
  return (
    <div className="technical-journey">
      <section className="journey-hero">
        <h2 className="journey-hero__title">Building a Multi-Collection RAG System</h2>
        <p className="journey-hero__description">
          A walkthrough of how two heterogeneous JSON datasets were transformed into
          separate Qdrant vector collections with intelligent query routing, parallel
          retrieval, and structured LLM synthesis.
        </p>

        <div className="tech-stack">
          {TECH_STACK.map((tech) => (
            <div key={tech.name} className="tech-stack__item">
              <span className="tech-stack__name">{tech.name}</span>
              <span className="tech-stack__role">{tech.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="journey-steps" aria-label="Pipeline steps">
        <h3 className="section-heading">Pipeline Steps</h3>
        <div className="journey-steps__list">
          {JOURNEY_STEPS.map((step, index) => (
            <JourneyStep
              key={step.id}
              step={step}
              isLast={index === JOURNEY_STEPS.length - 1}
            />
          ))}
        </div>
      </section>

      <section className="journey-workflow" aria-label="Query routing workflow">
        <h3 className="section-heading">Query Routing Architecture</h3>
        <p className="journey-workflow__intro">
          When a user submits a query, the intent classifier determines which vector
          collection(s) to search. Single-intent queries hit one collection; cross-domain
          queries fan out to both, merge results, and pass combined context to the LLM.
        </p>
        <WorkflowDiagram />
      </section>

      <section className="journey-routing" aria-label="Routing examples">
        <h3 className="section-heading">Routing Examples</h3>
        <div className="routing-cards">
          <div className="routing-card">
            <span className="routing-card__intent">Ideas only</span>
            <p className="routing-card__query">
              &ldquo;What infrastructure ideas exist for donation matching?&rdquo;
            </p>
            <div className="routing-card__path">
              <span>Classifier</span>
              <span className="routing-card__arrow">→</span>
              <span className="routing-card__collection">ideas_rag</span>
              <span className="routing-card__arrow">→</span>
              <span>LLM</span>
            </div>
          </div>

          <div className="routing-card">
            <span className="routing-card__intent">Hackathon only</span>
            <p className="routing-card__query">
              &ldquo;Who won the Cypherpunk hackathon grand prize?&rdquo;
            </p>
            <div className="routing-card__path">
              <span>Classifier</span>
              <span className="routing-card__arrow">→</span>
              <span className="routing-card__collection">hackathon_winners_rag</span>
              <span className="routing-card__arrow">→</span>
              <span>LLM</span>
            </div>
          </div>

          <div className="routing-card routing-card--both">
            <span className="routing-card__intent">Both collections</span>
            <p className="routing-card__query">
              &ldquo;Compare winning DeFi projects with related idea submissions&rdquo;
            </p>
            <div className="routing-card__path">
              <span>Classifier</span>
              <span className="routing-card__arrow">→</span>
              <span className="routing-card__collection">ideas_rag</span>
              <span>+</span>
              <span className="routing-card__collection">hackathon_winners_rag</span>
              <span className="routing-card__arrow">→</span>
              <span>Merge</span>
              <span className="routing-card__arrow">→</span>
              <span>LLM</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TechnicalJourney;
