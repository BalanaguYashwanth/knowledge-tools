function JourneyStep({ step, isLast }) {
  return (
    <article className="journey-step">
      <div className="journey-step__indicator">
        <span className="journey-step__number">{step.number}</span>
        {!isLast && <span className="journey-step__line" aria-hidden="true" />}
      </div>

      <div className="journey-step__content">
        <h3 className="journey-step__title">{step.title}</h3>
        <p className="journey-step__summary">{step.summary}</p>

        <ul className="journey-step__details">
          {step.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>

        <div className="journey-step__tags">
          {step.tags.map((tag) => (
            <span key={tag} className="journey-step__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default JourneyStep;
