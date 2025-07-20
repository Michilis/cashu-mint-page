import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Star, User, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { ReviewWithMint } from '../hooks/useGlobalReviews';
import { formatRelativeTime } from '../utils/nostr';

import 'swiper/css';
import 'swiper/css/navigation';

interface ReviewCarouselProps {
  reviews: ReviewWithMint[];
  loading?: boolean;
}

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews, loading }) => {
  if (loading) {
    return (
      <div className="relative px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mr-3"></div>
          <span className="text-brand-text">Loading recent reviews...</span>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="relative px-4 py-8">
        <div className="text-center py-12 text-brand-textDark">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p>No recent reviews found</p>
          <p className="text-sm mt-2">Reviews will appear here as they're published</p>
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
          delay: 6000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
        }}
        className="review-carousel"
      >
        {reviews.map((review, index) => {
          // Extract mint domain for routing
          const mintDomain = review.mintUrl.replace(/^https?:\/\//, '');
          
          return (
            <SwiperSlide key={`${review.id}-${index}`}>
              <Link
                to={`/${mintDomain}`}
                className="block bg-gray-800/50 backdrop-blur rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-700 hover:border-brand-primary group h-full"
              >
                {/* Header with Mint Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-primary">
                        {review.mintName?.charAt(0) || 'M'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        {review.mintName || 'Unknown Mint'}
                      </h3>
                      <p className="text-xs text-brand-textDark">
                        {mintDomain.split('/')[0]}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-brand-textDark opacity-0 group-hover:opacity-100 transition-all" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {review.rating}/5
                  </span>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-brand-text text-sm line-clamp-3">
                    {review.content.replace(/^\s*\[\d\/5\]\s*/, '').trim()}
                  </p>
                </div>

                {/* Footer with Author and Time */}
                <div className="flex items-center justify-between text-xs text-brand-textDark mt-auto">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>
                      {`${review.pubkey.substring(0, 8)}...`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(review.created_at)}</span>
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

export default ReviewCarousel; 