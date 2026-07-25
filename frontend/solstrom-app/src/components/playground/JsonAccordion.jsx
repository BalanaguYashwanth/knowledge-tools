import { useState, useMemo } from 'react';

const SAMPLE_SIZE = 5;

function JsonAccordion({ dataset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const recordCount = dataset.data.length;

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return dataset.data.slice(0, SAMPLE_SIZE);

    const term = search.toLowerCase();
    return dataset.data
      .filter((record) => {
        const preview = dataset.getPreview(record);
        return Object.values(preview).some(
          (val) => val && String(val).toLowerCase().includes(term)
        );
      })
      .slice(0, SAMPLE_SIZE);
  }, [dataset, search]);

  const rawSample = useMemo(
    () => JSON.stringify(filteredRecords, null, 2),
    [filteredRecords]
  );

  return (
    <div className={`json-accordion ${isOpen ? 'json-accordion--open' : ''}`}>
      <button
        type="button"
        className="json-accordion__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <div className="json-accordion__trigger-content">
          <span className="json-accordion__label">{dataset.label}</span>
          <span className="json-accordion__meta">
            {recordCount.toLocaleString()} records · {dataset.collection}
          </span>
        </div>
        <svg
          className="json-accordion__chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="json-accordion__body">
          <p className="json-accordion__description">{dataset.description}</p>

          <div className="json-accordion__toolbar">
            <input
              type="search"
              className="json-accordion__search"
              placeholder="Filter records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={`Search ${dataset.label}`}
            />
            <button
              type="button"
              className={`json-accordion__toggle-view ${showPreview ? 'json-accordion__toggle-view--active' : ''}`}
              onClick={() => setShowPreview((prev) => !prev)}
            >
              {showPreview ? 'Raw JSON' : 'Preview'}
            </button>
          </div>

          {showPreview ? (
            <ul className="json-accordion__records">
              {filteredRecords.map((record, index) => {
                const preview = dataset.getPreview(record);
                return (
                  <li key={record.id ?? index} className="json-accordion__record">
                    <h4 className="json-accordion__record-title">{preview.title}</h4>
                    <dl className="json-accordion__record-fields">
                      {Object.entries(preview)
                        .filter(([key]) => key !== 'title')
                        .map(([key, value]) =>
                          value ? (
                            <div key={key} className="json-accordion__field">
                              <dt>{formatFieldName(key)}</dt>
                              <dd>{String(value)}</dd>
                            </div>
                          ) : null
                        )}
                    </dl>
                  </li>
                );
              })}
            </ul>
          ) : (
            <pre className="json-accordion__raw">
              <code
                dangerouslySetInnerHTML={{ __html: highlightJson(rawSample) }}
              />
            </pre>
          )}

          {!search && recordCount > SAMPLE_SIZE && (
            <p className="json-accordion__footnote">
              Showing {SAMPLE_SIZE} of {recordCount.toLocaleString()} records.
              Use search to explore the full dataset.
            </p>
          )}
          {search && filteredRecords.length === 0 && (
            <p className="json-accordion__footnote">No records match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

function formatFieldName(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase());
}

function highlightJson(json) {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-hl__number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-hl__key' : 'json-hl__string';
      } else if (/true|false/.test(match)) {
        cls = 'json-hl__boolean';
      } else if (/null/.test(match)) {
        cls = 'json-hl__null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default JsonAccordion;
