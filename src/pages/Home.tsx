import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bitcoin, Zap, Lock, Shield, Search, TrendingUp, Users, MessageSquare, ArrowRight, Star, Globe, Loader } from 'lucide-react';
import { useGlobalReviews } from '../hooks/useGlobalReviews';
import { usePopularMints } from '../hooks/usePopularMints';
import ReviewCarousel from '../components/ReviewCarousel';
import MintCarousel from '../components/MintCarousel';

const features = [
  {
    icon: <Bitcoin className="h-6 w-6" />,
    title: "Bitcoin-Native",
    description: "Built on Bitcoin and Lightning Network for secure, instant transactions"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Experience instant transfers with Lightning Network integration"
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Privacy First",
    description: "Enhanced privacy with Chaumian blind signatures"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure by Design",
    description: "Built with security best practices and continuous auditing"
  }
];

const stats = [
  { label: 'Cashu Mints', value: '50+', icon: <Globe className="h-5 w-5" /> },
  { label: 'Cashu Reviews', value: '200+', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Community Members', value: '1.2k+', icon: <Users className="h-5 w-5" /> },
];

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { recentReviews, loading: reviewsLoading } = useGlobalReviews(12);
  const { popularMints, loading: mintsLoading } = usePopularMints();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Remove protocol prefixes if present and navigate
      const cleanTerm = searchTerm.replace(/^https?:\/\//, '');
      navigate(`/${cleanTerm}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-purple-600/10 opacity-50"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent">
              Discover Cashu Mints
            </h1>
            <p className="text-xl md:text-2xl text-brand-text mb-8 leading-relaxed">
              Explore trusted Cashu mints, read community reviews, and find the perfect mint for your Bitcoin privacy needs
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-textDark h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter mint URL (e.g. mint.example.com)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-brand-textDark focus:ring-2 focus:ring-brand-primary focus:border-transparent backdrop-blur"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Explore
                </button>
              </div>
            </form>
            {/* Stats section removed */}
          </div>
        </div>
      </div>

      {/* Latest Reviews Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-brand-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Latest Cashu Mint Reviews</h2>
            </div>
            <p className="text-xl text-brand-text max-w-2xl mx-auto">
              See what the community is saying about Cashu mints.
            </p>
          </div>
          
          <ReviewCarousel reviews={recentReviews} loading={reviewsLoading} />
          
          {recentReviews.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-brand-textDark text-sm">
                Showing latest reviews • Powered by NIP-87
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Mints Section */}
      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Most Reviewed Cashu Mints</h2>
            <p className="text-xl text-brand-text">
              Trusted by the community with the highest number of reviews
            </p>
          </div>

          {mintsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin h-8 w-8 text-brand-primary mr-3" />
              <span className="text-brand-text">Finding popular mints...</span>
            </div>
          ) : popularMints.length > 0 ? (
            <MintCarousel mints={popularMints} />
          ) : (
            <div className="text-center py-12 text-brand-textDark">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p>No popular mints data available yet</p>
              <p className="text-sm mt-2">Popular mints will appear as reviews are collected</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Cashu?</h2>
            <p className="text-xl text-brand-text">
              The future of private Bitcoin transactions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-800/20 rounded-xl backdrop-blur border border-gray-700/50 hover:border-brand-primary/50 transition-all duration-300"
              >
                <div className="text-brand-primary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-brand-text text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-primary/10 to-purple-600/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-xl text-brand-text mb-8 max-w-2xl mx-auto">
            Start your journey with Cashu mints. Find trusted mints, read reviews, and join the privacy revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/discover')}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Explore Mints
            </button>
            <a
              href="https://cashu.space"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors border border-gray-600"
            >
              Learn About Cashu
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;