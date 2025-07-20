import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Star, MessageSquare, ExternalLink, Globe } from 'lucide-react';
import { PopularMint } from '../hooks/usePopularMints';

import 'swiper/css';
import 'swiper/css/navigation';

interface MintCarouselProps {
  mints: PopularMint[];
  loading?: boolean;
}

const MintCarousel: React.FC<MintCarouselProps> = ({ mints, loading }) => {
  if (loading) {
    return (
      <div className="relative px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mr-3"></div>
          <span className="text-brand-text">Loading popular mints...</span>
        </div>
      </div>
    );
  }

  if (mints.length === 0) {
    return (
      <div className="relative px-4 py-8">
        <div className="text-center py-12 text-brand-textDark">
          <Globe className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p>No popular mints found</p>
          <p className="text-sm mt-2">Popular mints will appear here as reviews are collected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-8">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="mint-carousel"
      >
        {mints.map((mint, index) => {
          // Extract mint domain for routing and remove protocol prefixes
          const mintDomain = mint.mintUrl.replace(/^https?:\/\//, '');
          
          return (
            <SwiperSlide key={`${mint.mintUrl}-${index}`}>
              <Link
                to={`/${mintDomain}`}
                className="block bg-gray-800/50 backdrop-blur rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-700 hover:border-brand-primary group h-full"
              >
                {/* Header with Mint Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-primary">
                        {mint.mintName?.charAt(0) || 'M'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        {mint.mintName || 'Unknown Mint'}
                      </h3>
                      <p className="text-xs text-brand-textDark">
                        {mintDomain.split('/')[0]}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-brand-textDark opacity-0 group-hover:opacity-100 transition-all" />
                </div>

                {/* Review Count */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-brand-primary" />
                    <span className="text-sm font-medium text-brand-primary">
                      {mint.reviewCount} reviews
                    </span>
                  </div>
                </div>

                {/* Rating */}
                {mint.reviewCount > 0 ? (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(mint.averageRating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {mint.averageRating.toFixed(1)}/5
                    </span>
                  </div>
                ) : (
                  <div className="mb-3">
                    <span className="text-xs text-brand-textDark">No reviews yet</span>
                  </div>
                )}

                {/* Footer with Ranking */}
                <div className="flex items-center justify-between text-xs text-brand-textDark mt-auto">
                  <div className="flex items-center gap-1">
                    <span className="text-brand-primary font-medium">
                      #{index + 1} Most Reviewed
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Explore</span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default MintCarousel;