import React from 'react';
import { Link } from 'react-router-dom';
import { Bitcoin, Zap, Lock, Shield } from 'lucide-react';
import { useMintStore } from '../store/mintStore';
import MintCarousel from '../components/MintCarousel';

const features = [
  {
    icon: <Bitcoin className="h-8 w-8" />,
    title: "Bitcoin-Native",
    description: "Built on Bitcoin and Lightning Network technology for secure, instant transactions"
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Lightning Fast",
    description: "Experience instant transfers with Lightning Network integration"
  },
  {
    icon: <Lock className="h-8 w-8" />,
    title: "Privacy First",
    description: "Enhanced privacy with Chaumian blind signatures"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Secure by Design",
    description: "Built with security best practices and continuous auditing"
  }
];

const Home: React.FC = () => {
  const mints = useMintStore((state) => state.getMints());

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-brand-primary">Cashu</span> Mint Directory
          </h1>
          <p className="text-xl text-brand-text">
            Explore and connect with Cashu mints - your gateway to private, instant Bitcoin transactions
          </p>
        </div>

        {/* Recently Viewed Mints Carousel */}
        {mints.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Recently Viewed Mints</h2>
            <MintCarousel mints={mints} />
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-800/30 rounded-xl backdrop-blur border border-gray-700/50"
            >
              <div className="text-brand-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-brand-text text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-brand-textDark">
            <p>© {new Date().getFullYear()} Cashu Mint Directory</p>
            <p className="text-sm mt-2">
              Powered by{" "}
              <a
                href="https://cashu.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-brand-light transition-colors"
              >
                Cashu Protocol
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;