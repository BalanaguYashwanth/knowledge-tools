const TABS = [
  { id: 'playground', label: 'Playground' },
  { id: 'journey', label: 'Technical Journey' },
];

function Header({ activeTab, onTabChange }) {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden="true">
          ◈
        </span>
        <div className="header__titles">
          <h1 className="header__title">Solstrom RAG</h1>
          <p className="header__subtitle">Multi-collection retrieval playground</p>
        </div>
      </div>

      <nav className="header__nav" role="tablist" aria-label="Main navigation">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`header__tab ${activeTab === tab.id ? 'header__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Header;
