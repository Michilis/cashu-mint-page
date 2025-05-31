import React from 'react';
import { MintInfo } from '../types';
import InfoCard from './cards/InfoCard';
import QRCard from './cards/QRCard';

interface InfoSectionProps {
  mintInfo: MintInfo;
}

const InfoSection: React.FC<InfoSectionProps> = ({ mintInfo }) => {
  const showMotd = import.meta.env.VITE_ENABLE_MOTD === 'true' && mintInfo.motd;
  const showTos = import.meta.env.VITE_ENABLE_TOS === 'true' && mintInfo.terms_of_service_url;
  const showIcon = import.meta.env.VITE_ENABLE_ICON === 'true' && mintInfo.icon;

  // Get the primary mint URL
  const mintUrl = mintInfo.url || (mintInfo.urls && mintInfo.urls[0]);

  return (
    <>
      <InfoCard
        mintInfo={mintInfo}
        showMotd={showMotd}
        showTos={showTos}
        showIcon={showIcon}
      />
      {mintUrl && <QRCard mintUrl={mintUrl} />}
    </>
  );
};

export default InfoSection;