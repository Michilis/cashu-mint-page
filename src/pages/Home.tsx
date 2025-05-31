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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;