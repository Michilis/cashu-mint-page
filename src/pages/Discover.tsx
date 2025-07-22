import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MessageSquare, Globe, Filter, ArrowRight, Loader, TrendingUp } from 'lucide-react';
import { useAllMints } from '../hooks/useAllMints';
import { useSEO } from '../hooks/useSEO';

interface MintData {
  mintUrl: string;
  mintName: string;
  domain: string;
  reviewCount: number;
  averageRating: number;
}

const Discover: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'reviews' | 'rating' | 'name'>('reviews');
  const [filterMinReviews, setFilterMinReviews] = useState<number>(0);
  const { mints, loading, error } = useAllMints();

  const [filteredMints, setFilteredMints] = useState<MintData[]>([]);

  // SEO meta tags for discover page
  useSEO({
    title: 'Discover Cashu Mints - Community Reviews & Ratings | CashuMints.space',
    description: 'Browse all Cashu mints with community reviews, ratings, and technical details. Find the perfect mint for your Bitcoin ecash needs.',
    keywords: 'cashu mints, bitcoin ecash, discover mints, mint reviews, mint ratings, cashu directory, bitcoin privacy',
    canonicalUrl: 'https://cashumints.space/discover',
    ogType: 'website'
  });

  useEffect(() => {
    let filtered = [...mints];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(mint => 
        mint.mintName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mint.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply minimum reviews filter
    if (filterMinReviews > 0) {
      filtered = filtered.filter(mint => mint.reviewCount >= filterMinReviews);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'name':
          return a.mintName.localeCompare(b.mintName);
        default:
          return 0;
      }
    });

    setFilteredMints(filtered);
  }, [mints, searchTerm, sortBy, filterMinReviews]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-purple-600/10 opacity-50"></div>
        <div className="container mx-auto px-4 py-20 md:py-24 relative">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="h-8 w-8 text-brand-primary" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent">
                Discover Cashu Mints
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-brand-text mb-8 leading-relaxed">
              Explore all available Cashu mints, compare reviews, and find the perfect mint for your Bitcoin privacy needs
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-textDark h-5 w-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search mints by name or domain..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-brand-textDark focus:ring-2 focus:ring-brand-primary focus:border-transparent backdrop-blur"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-brand-textDark" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'reviews' | 'rating' | 'name')}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="reviews">Sort by Reviews</option>
                    <option value="rating">Sort by Rating</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-brand-textDark" />
                  <select
                    value={filterMinReviews}
                    onChange={(e) => setFilterMinReviews(Number(e.target.value))}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value={0}>All Mints</option>
                    <option value={1}>With Reviews</option>
                    <option value={5}>5+ Reviews</option>
                    <option value={10}>10+ Reviews</option>
                    <option value={20}>20+ Reviews</option>
                  </select>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Mints Grid */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-brand-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {loading ? 'Loading Mints...' : `${filteredMints.length} Cashu Mints Found`}
              </h2>
            </div>
            {!loading && (
              <p className="text-xl text-brand-text">
                {searchTerm || filterMinReviews > 0 
                  ? `Showing ${filteredMints.length} of ${mints.length} mints` 
                  : 'All available Cashu mints from the Nostr network'
                }
              </p>
            )}
          </div>

          {error && (
            <div className="text-center py-12 text-red-400">
              <p className="text-lg mb-2">Error loading mints</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin h-8 w-8 text-brand-primary mr-3" />
              <span className="text-brand-text">Loading mints...</span>
            </div>
          ) : filteredMints.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredMints.map((mint, index) => (
                <Link
                  key={mint.mintUrl}
                  to={`/${mint.mintUrl.replace(/^https?:\/\//, '')}`}
                  className="group bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700 hover:border-brand-primary transition-all duration-300 hover:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{mint.mintName}</h3>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-brand-primary" />
                      <span className="text-sm font-medium text-brand-primary">{mint.reviewCount}</span>
                    </div>
                  </div>
                  
                  {mint.reviewCount > 0 ? (
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
                  ) : (
                    <div className="mb-2">
                      <span className="text-xs text-brand-textDark">Not rated</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-brand-textDark group-hover:text-brand-text transition-colors">
                    {mint.domain}
                  </p>
                  
                  <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-700">
                    <ArrowRight className="h-4 w-4 text-brand-textDark group-hover:text-brand-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-brand-textDark">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-lg mb-2">No mints found</p>
              <p className="text-sm">
                {searchTerm 
                  ? `No mints match "${searchTerm}"` 
                  : filterMinReviews > 0 
                    ? `No mints have ${filterMinReviews}+ reviews` 
                    : 'No mints data available yet'
                }
              </p>
              {(searchTerm || filterMinReviews > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterMinReviews(0);
                  }}
                  className="mt-4 text-brand-primary hover:text-brand-light transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Discover; 