import { useState } from 'react';
import Header from './components/layout/Header';
import Playground from './components/playground/Playground';
import TechnicalJourney from './components/journey/TechnicalJourney';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('playground');

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="app__main" role="main">
        {activeTab === 'playground' ? <Playground /> : <TechnicalJourney />}
      </main>
    </div>
  );
}

export default App;
