import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MintPage from './pages/MintPage';
import Analytics from './components/Analytics';

function App() {
  // Get base path from environment variable, default to '/'
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  
  console.log('🌐 App base path:', basePath);

  return (
    <BrowserRouter basename={basePath}>
      <Analytics />
      <div className="min-h-screen bg-brand-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<MintPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App