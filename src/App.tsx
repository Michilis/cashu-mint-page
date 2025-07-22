import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Discover from './pages/Discover';
import MintPage from './pages/MintPage';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Disclaimer from './pages/Disclaimer';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileMenu from './components/MobileMenu';

function AppContent() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Don't show global footer on single mint pages (they have their own footer)
  const isSingleMintPage = location.pathname !== '/' && 
                          location.pathname !== '/discover' && 
                          location.pathname.split('/').length > 1;

  // For active link highlighting
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isActive={isActive}
        menuRef={menuRef}
      />
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isActive={isActive}
        menuRef={menuRef}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/*" element={<MintPage />} />
        </Routes>
      </main>
      {!isSingleMintPage && <Footer />}
    </div>
  );
}

function App() {
  // Get base path from environment variable, default to '/'
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  
  console.log('🌐 App base path:', basePath);

  return (
    <BrowserRouter basename={basePath}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App