import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMintInfoByDomain } from '../services/api';
import { MintInfo } from '../types';
import { useMintStore } from '../store/mintStore';
import InfoSection from '../components/InfoSection';
import ContactCard from '../components/cards/ContactCard';
import NutSupportCard from '../components/cards/NutSupportCard';
import NipSupportCard from '../components/cards/NipSupportCard';
import MetaInfoCard from '../components/cards/MetaInfoCard';
import ReviewsCard from '../components/cards/ReviewsCard';
import Loader from '../components/Loader';
import ErrorDisplay from '../components/ErrorDisplay';
import MintHeader from '../components/MintHeader';

const MintPage: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const addMint = useMintStore((state) => state.addMint);

  const fetchMintInfo = async () => {
    if (!domain) return;
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMintInfoByDomain(domain);
      setMintInfo(data);
      addMint(domain, data);
      document.title = `${data.name || domain} Mint Info`;
    } catch (err) {
      console.error('Error fetching mint info:', err);
      setError(`Failed to load mint information for ${domain}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMintInfo();
  }, [domain]);

  const showContact = import.meta.env.VITE_ENABLE_CONTACT === 'true' && mintInfo?.contact;
  const showNutTable = import.meta.env.VITE_ENABLE_NUT_TABLE === 'true' && mintInfo?.nuts;
  const showNipTable = import.meta.env.VITE_ENABLE_NIP_TABLE === 'true' && mintInfo?.nips;

  if (loading) return <Loader />;
  if (error) return <ErrorDisplay message={error} retryFn={fetchMintInfo} />;
  if (!mintInfo) return <ErrorDisplay message="No mint information available" retryFn={fetchMintInfo} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <MintHeader mintInfo={mintInfo} />
      
      <div className="max-w-4xl mx-auto space-y-6">
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
          mintUrl={mintInfo.url || mintInfo.urls?.[0] || domain || ''} 
          mintName={mintInfo.name || domain || 'Unknown Mint'} 
        />
      </div>

      <footer className="mt-12 text-center text-brand-textDark py-4">
        <p>© {new Date().getFullYear()} Cashu Mint Information</p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <a
            href="https://github.com/Michilis/cashu-mint-page"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-textDark hover:text-brand-primary transition-colors flex items-center space-x-1"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
        <p className="text-sm mt-2 text-brand-textDark">
          Made with ❤️ by{" "}
          <a
            href="https://azzamo.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-light transition-colors"
          >
            Azzamo
          </a>
        </p>
      </footer>
    </div>
  );
};

export default MintPage;