import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bitcoin, Zap, Lock, Shield, Search, TrendingUp, Users, MessageSquare, ArrowRight, Star, Globe, Loader } from 'lucide-react';
import { useGlobalReviews } from '../hooks/useGlobalReviews';
import { usePopularMints } from '../hooks/usePopularMints';
import ReviewCarousel from '../components/ReviewCarousel';

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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center text-brand-primary mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-brand-textDark">{stat.label}</div>
                </div>
              ))}
            </div>
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
              See what the community is saying about Cashu mints. Real reviews from real users using the NIP-87 protocol.
            </p>
          </div>
          
          <ReviewCarousel reviews={recentReviews} loading={reviewsLoading} />
          
          {recentReviews.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-brand-textDark text-sm">
                Showing latest reviews • Powered by NIP-87 protocol
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {popularMints.map((mint, index) => (
                <Link
                  key={mint.mintUrl}
                  to={`/${mint.mintUrl.replace(/^https?:\/\//, '')}`}
                  className="group bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700 hover:border-brand-primary transition-all duration-300 hover:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-primary">
                        {mint.mintName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-brand-primary" />
                      <span className="text-sm font-medium text-brand-primary">{mint.reviewCount}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{mint.mintName}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.round(mint.averageRating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-brand-text">
                      {mint.averageRating.toFixed(1)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-brand-textDark group-hover:text-brand-text transition-colors">
                    {mint.domain}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-brand-textDark">
                      #{index + 1} Most Reviewed
                    </span>
                    <ArrowRight className="h-4 w-4 text-brand-textDark group-hover:text-brand-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
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
              onClick={() => document.querySelector('input')?.focus()}
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

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-brand-textDark">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-brand-primary mb-2">Cashu Mint Explorer</h3>
              <p className="text-sm">
                Powered by{" "}
                <a
                  href="https://cashu.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-light transition-colors"
                >
                  Cashu Protocol
                </a>
                {" "}and NIP-87 reviews
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mb-6">
              <a
                href="https://github.com/Michilis/cashu-mint-page"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-textDark hover:text-brand-primary transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>

            <p className="text-sm">
              © {new Date().getFullYear()} Cashu Mint Explorer • Made with ❤️ by{" "}
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