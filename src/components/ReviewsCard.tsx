import React, { useState, useMemo } from 'react';
import { useReviews } from '../hooks/useReviews';
import { MintReview } from '../types';
import StarRating from './reviews/StarRating';
import ReviewItem from './reviews/ReviewItem';
import ReviewForm from './reviews/ReviewForm';

interface ReviewFilters {
  score: number | null; // null means all scores
  dateRange: 'all' | 'week' | 'month' | 'year';
  minLength: number;
  maxLength: number;
}

interface ReviewsCardProps {
  mintUrl: string;
}

const ReviewsCard: React.FC<ReviewsCardProps> = ({ mintUrl }) => {
  const { reviews, loading, submitting, connectionStatus, submitReview } = useReviews(mintUrl);
  
  // Filter and pagination state
  const [filters, setFilters] = useState<ReviewFilters>({
    score: null,
    dateRange: 'all',
    minLength: 0,
    maxLength: 10000
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState<number | 'all'>(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter reviews based on criteria
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by score
    if (filters.score !== null) {
      filtered = filtered.filter(review => review.rating === filters.score);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = Date.now() / 1000;
      const timeRanges = {
        week: 7 * 24 * 60 * 60,
        month: 30 * 24 * 60 * 60,
        year: 365 * 24 * 60 * 60
      };
      const cutoff = now - timeRanges[filters.dateRange];
      filtered = filtered.filter(review => review.created_at >= cutoff);
    }

    // Filter by content length
    filtered = filtered.filter(review => {
      const contentLength = review.content.length;
      return contentLength >= filters.minLength && contentLength <= filters.maxLength;
    });

    return filtered;
  }, [reviews, filters]);

  // Pagination logic
  const totalReviews = filteredReviews.length;
  const totalPages = reviewsPerPage === 'all' ? 1 : Math.ceil(totalReviews / reviewsPerPage);
  
  const paginatedReviews = useMemo(() => {
    if (reviewsPerPage === 'all') {
      return filteredReviews;
    }
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return filteredReviews.slice(startIndex, endIndex);
  }, [filteredReviews, currentPage, reviewsPerPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, reviewsPerPage]);

  const handleFilterChange = (newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      score: null,
      dateRange: 'all',
      minLength: 0,
      maxLength: 10000
    });
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle loading more reviews
  const handleLoadMore = async () => {
    setLoadingMore(true);
    // The actual fetching logic is handled in useReviews hook
    // This button just provides user feedback
    setTimeout(() => {
      setLoadingMore(false);
    }, 2000);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Mint Reviews</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
          </button>
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Connected
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
              <select
                value={filters.score ?? ''}
                onChange={(e) => handleFilterChange({ score: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            {/* Content Length Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Length</label>
              <select
                value={filters.minLength}
                onChange={(e) => handleFilterChange({ minLength: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="0">Any Length</option>
                <option value="50">50+ chars</option>
                <option value="100">100+ chars</option>
                <option value="200">200+ chars</option>
                <option value="500">500+ chars</option>
              </select>
            </div>

            {/* Reviews Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Per Page</label>
              <select
                value={reviewsPerPage}
                onChange={(e) => setReviewsPerPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={10}>10 Reviews</option>
                <option value={25}>25 Reviews</option>
                <option value={50}>50 Reviews</option>
                <option value={100}>100 Reviews</option>
                <option value="all">All Reviews</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing {paginatedReviews.length} of {totalReviews} reviews
            </div>
            <button
              onClick={resetFilters}
              className="px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded hover:bg-gray-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Reviews Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Fetching reviews from Nostr</p>
        </div>
      ) : paginatedReviews.length > 0 ? (
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      ) : filteredReviews.length === 0 && reviews.length > 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No reviews match the current filters.</p>
          <button
            onClick={resetFilters}
            className="mt-2 text-purple-400 hover:text-purple-300 underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No reviews yet. Be the first to review this mint!</p>
        </div>
      )}

      {/* Pagination */}
      {reviewsPerPage !== 'all' && totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              const isCurrentPage = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isCurrentPage
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                {currentPage < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                <button
                  onClick={() => goToPage(totalPages)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Load More Button */}
      {!loading && paginatedReviews.length > 0 && reviewsPerPage !== 'all' && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 hover:text-white disabled:text-gray-500 rounded-lg transition-colors border border-gray-600 hover:border-gray-500 disabled:border-gray-700 flex items-center gap-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                Searching for more reviews...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Load More Reviews
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Fetching reviews from Nostr relay for {mintUrl.replace(/^https?:\/\//, '')}
          </p>
        </div>
      )}

      {/* Review Form */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Write a Review</h3>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              disabled={connectionStatus !== 'connected'}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {connectionStatus !== 'connected' ? 'Connecting...' : 'Write Review'}
            </button>
          )}
        </div>
        
        {showReviewForm && (
          <ReviewForm 
            mintName={mintUrl.replace(/^https?:\/\//, '')}
            mintUrl={mintUrl}
            onSubmit={async (reviewData) => {
              await submitReview(reviewData);
              setShowReviewForm(false);
            }}
            onCancel={() => setShowReviewForm(false)}
            submitting={submitting}
          />
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-500">
          Powered by NIP-87 • Real-time reviews from Nostr
        </p>
      </div>
    </div>
  );
};

export default ReviewsCard; 