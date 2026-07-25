import { DATASETS } from '../../constants/datasets';
import JsonAccordion from './JsonAccordion';

function DataPanel() {
  return (
    <section className="data-panel" aria-label="Source datasets">
      <div className="data-panel__header">
        <h2 className="data-panel__title">Source Data</h2>
        <p className="data-panel__subtitle">
          Explore the indexed JSON collections used by the RAG pipeline
        </p>
      </div>

      <div className="data-panel__stack">
        {DATASETS.map((dataset) => (
          <JsonAccordion key={dataset.id} dataset={dataset} />
        ))}
      </div>
    </section>
  );
}

export default DataPanel;
