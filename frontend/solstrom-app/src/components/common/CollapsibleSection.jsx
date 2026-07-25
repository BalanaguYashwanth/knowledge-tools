import { useState } from 'react';

function CollapsibleSection({ label, children, html }) {
  const [open, setOpen] = useState(false);
  if (!html && !children) return null;

  return (
    <div className="chat-collapsible">
      <button
        type="button"
        className="chat-collapsible__toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className="chat-collapsible__chevron" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && (
        html ? (
          <div
            className="chat-collapsible__body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="chat-collapsible__body">{children}</div>
        )
      )}
    </div>
  );
}

export default CollapsibleSection;
