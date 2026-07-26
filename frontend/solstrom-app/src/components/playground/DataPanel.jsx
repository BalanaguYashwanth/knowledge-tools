import { useState } from 'react';
import { DATASETS } from '../../constants/datasets';
import JsonAccordion from './JsonAccordion';

function DataPanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section
      className={`data-panel ${isOpen ? 'data-panel--open' : 'data-panel--collapsed'}`}
      aria-label="Source datasets"
    >
      <div className="data-panel__header">
        <div className="data-panel__title-row">
          <h2 className="data-panel__title">Source Data</h2>
          <button
            type="button"
            className="data-panel__toggle"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse source data' : 'Expand source data'}
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            <svg
              className="data-panel__chevron"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 6L9 12L15 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {isOpen && (
          <p className="data-panel__subtitle">
            Explore the indexed JSON collections used by the RAG pipeline
          </p>
        )}
      </div>

      {isOpen && (
        <div className="data-panel__stack">
          {DATASETS.map((dataset) => (
            <JsonAccordion key={dataset.id} dataset={dataset} />
          ))}
        </div>
      )}
    </section>
  );
}

export default DataPanel;
