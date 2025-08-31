import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMintInfoByDomain } from '../services/api';
import { MintInfo } from '../types';
import { useMintStore } from '../store/mintStore';
import { trackMintView, trackMintInfoFetch } from '../utils/analytics';
import { useSEO, createMintStructuredData } from '../hooks/useSEO';
import InfoSection from '../components/InfoSection';
import ContactCard from '../components/cards/ContactCard';
import NutSupportCard from '../components/cards/NutSupportCard';
import NipSupportCard from '../components/cards/NipSupportCard';
import MetaInfoCard from '../components/cards/MetaInfoCard';
import ReviewsCard from '../components/cards/ReviewsCard';
import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import MintHeader from '../components/MintHeader';
import { normalizeMintPath, isOnionHost } from '../utils/url';

const MintPage: React.FC = () => {
  const location = useLocation();
  // Extract the full path excluding the leading slash and clean URL
  const rawMintPath = location.pathname.slice(1);
  const mintPath = rawMintPath.replace(/^https?:\/\//, '');
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const addMint = useMintStore((state) => state.addMint);

  // Redirect if URL contains protocol prefixes
  useEffect(() => {
    if (rawMintPath !== mintPath) {
      // URL contains protocol prefixes, redirect to clean URL
      window.history.replaceState(null, '', `/${mintPath}`);
      console.log('🔄 Redirected from', rawMintPath, 'to', mintPath);
    }
  }, [rawMintPath, mintPath]);

  const fetchMintInfo = async () => {
    if (!mintPath) {
      console.error('❌ No mint path provided');
      setError('No mint domain specified');
      setLoading(false);
      return;
    }
    
    console.log('🏗️ MintPage: Starting fetch for mint path:', mintPath);
    console.log('🔍 Full pathname:', location.pathname);
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMintInfoByDomain(mintPath);
      console.log('✅ MintPage: Successfully fetched mint info:', data);
      
      setMintInfo(data);
      addMint(mintPath, data);
      
      // Track successful mint info fetch
      trackMintInfoFetch(data.url || mintPath, true);
    } catch (err) {
      console.error('❌ MintPage: Error fetching mint info:', err);
      const errorMessage = err instanceof Error ? err.message : `Failed to load mint information for ${mintPath}`;
      setError(errorMessage);
      
      // Track failed mint info fetch
      trackMintInfoFetch(mintPath, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMintInfo();
  }, [mintPath]);

  // If viewing an onion URL but mint advertises a clearnet URL, redirect to the clearnet single mint page
  useEffect(() => {
    if (!mintInfo) return;

    const { hostPath: currentHostPath, isOnion } = normalizeMintPath(mintPath);
    if (!isOnion) return;

    // Prefer a non-onion URL from mint info
    const candidateUrls: string[] = [];
    if (mintInfo.url) candidateUrls.push(mintInfo.url);
    if (mintInfo.urls && mintInfo.urls.length > 0) candidateUrls.push(...mintInfo.urls);

    const clearnet = candidateUrls.find((u) => u && !isOnionHost(u));
    if (clearnet) {
      const { hostPath } = normalizeMintPath(clearnet);
      if (hostPath && hostPath !== currentHostPath) {
        console.log('🔁 Redirecting from onion to clearnet mint page:', hostPath);
        window.location.replace(`/${hostPath}`);
      }
    }
  }, [mintInfo, mintPath]);

  // Track mint view when component mounts and mintInfo is loaded
  useEffect(() => {
    if (mintInfo && mintPath) {
      trackMintView(mintInfo.url || mintPath);
    }
  }, [mintInfo, mintPath]);

  // SEO meta tags for mint page
  const mintDisplayName = mintInfo?.name || mintPath;
  const pageTitle = mintInfo ? `${mintDisplayName} Mint – Reviews, NUT Support & Wallets | CashuMints.space` : undefined;
  const pageDescription = mintInfo ? `See what users think of ${mintDisplayName} mint. View NUT support, wallet compatibility, and community reviews.` : undefined;
  const canonicalUrl = `https://cashumints.space/${mintPath}`;
  const keywords = mintInfo ? `cashu, ${mintDisplayName}, mint, bitcoin, ecash, reviews, nuts, wallets, ${mintPath}` : undefined;
  const structuredData = mintInfo ? createMintStructuredData(mintInfo, mintPath) : undefined;

  useSEO({
    title: pageTitle,
    description: pageDescription,
    keywords,
    canonicalUrl,
    ogType: 'article',
    structuredData,
  });

  const showContact = import.meta.env.VITE_ENABLE_CONTACT === 'true' && mintInfo?.contact;
  const showNutTable = import.meta.env.VITE_ENABLE_NUT_TABLE === 'true' && mintInfo?.nuts;
  const showNipTable = import.meta.env.VITE_ENABLE_NIP_TABLE === 'true' && mintInfo?.nips;

  if (loading) return <Loader />;
  if (error) return <ErrorDisplay message={error} retryFn={fetchMintInfo} />;
  if (!mintInfo) return <ErrorDisplay message="No mint information available" retryFn={fetchMintInfo} />;

  return (
    <div className="w-full max-w-full px-2 sm:px-4 py-8 mx-auto overflow-x-hidden">
      <MintHeader mintInfo={mintInfo} />
      
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <InfoSection mintInfo={mintInfo} />
        
        {showContact && mintInfo.contact && (
          <ContactCard contacts={mintInfo.contact} />
        )}

        <MetaInfoCard mintInfo={mintInfo} />
        
        {showNutTable && mintInfo.nuts && (
          <NutSupportCard mintInfo={mintInfo} />
        )}

        {showNipTable && mintInfo.nips && (
          <NipSupportCard mintInfo={mintInfo} />
        )}

        {/* Reviews Section */}
        <ReviewsCard 
          mintUrl={mintInfo.url || mintInfo.urls?.[0] || mintPath || ''} 
          mintName={mintInfo.name || mintPath || 'Unknown Mint'} 
        />
      </div>

      <footer className="mt-12 text-center text-brand-textDark py-4">
        <p>© {new Date().getFullYear()} Cashu Mint Information</p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <a
            href="https://github.com/Michilis/cashu-mint-page"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-text hover:text-brand-primary"
          >
            GitHub
          </a>
          <a
            href="https://cashu.space"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-text hover:text-brand-primary"
          >
            Cashu Docs
          </a>
        </div>
      </footer>
    </div>
  );
};

export default MintPage;