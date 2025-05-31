import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MintPage from './pages/MintPage';
import Analytics from './components/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <div className="min-h-screen bg-brand-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:domain" element={<MintPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App