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
      
      <div className="max-w-4xl mx-auto">
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
      </div>

      <footer className="mt-12 text-center text-brand-textDark py-4">
        <p>© {new Date().getFullYear()} Cashu Mint Information</p>
      </footer>
    </div>
  );
};

export default MintPage;