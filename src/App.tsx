import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Discover from './pages/Discover';
import MintPage from './pages/MintPage';
import Header from './components/Header';

function App() {
  // Get base path from environment variable, default to '/'
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  
  console.log('🌐 App base path:', basePath);

  return (
    <BrowserRouter basename={basePath}>
      <div className="min-h-screen bg-brand-background">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/*" element={<MintPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App