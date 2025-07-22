import React, { useState, useMemo } from 'react';
import { MessageSquare, Filter, RefreshCw } from 'lucide-react';
import { useReviews } from '../../hooks/useReviews';
import StarRating from '../reviews/StarRating';
import ReviewItem from '../reviews/ReviewItem';
import ReviewForm from '../reviews/ReviewForm';

interface ReviewFilters {
  score: number | null; // null means all scores
  dateRange: 'all' | 'week' | 'month' | 'year';
  minLength: number;
  maxLength: number;
}

interface ReviewsCardProps {
  mintUrl: string;
  mintName: string;
}

const ReviewsCard: React.FC<ReviewsCardProps> = ({ mintUrl, mintName }) => {
  const { reviews, loading, submitting, connectionStatus, submitReview, loadMoreReviews, mintPubkey, hasMoreReviews, isLoadingMore } = useReviews(mintUrl);
  
  // State for filtering and pagination
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

  // Filter reviews based on criteria (mint filtering is now handled in useReviews hook)
  const filteredReviews = useMemo(() => {
    console.log('Applying UI filters to reviews for mint:', mintUrl);
    console.log('Total reviews from hook:', reviews.length);
    
    let filtered = [...reviews];

    // All reviews from the hook should already be for this mint due to strict filtering
    // Just apply the UI filters

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

    console.log('Final UI filtered reviews:', filtered.length);
    return filtered;
  }, [reviews, filters, mintUrl]);

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

  const handleLoadMore = async () => {
    if (loadMoreReviews) {
      await loadMoreReviews();
    }
  };

  const handleSubmitReview = async (reviewData: {
    rating: number;
    content: string;
  }) => {
    try {
      await submitReview(reviewData);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error instanceof Error ? error.message : 'Error submitting review. Please try again.');
    }
  };

  const averageRating = filteredReviews.length > 0 
    ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length 
    : 0;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-lg mr-4">
            <MessageSquare className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Reviews for {mintName}</h2>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-xs text-gray-400">Powered by NIP-87</p>
            </div>
            {filteredReviews.length > 0 && (
              <div className="flex items-center mt-2">
                <StarRating rating={Math.round(averageRating)} showLabel={false} />
                <span className="ml-2 text-sm text-gray-300">
                  {averageRating.toFixed(1)} ({filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Write Review button - shows first on mobile, second on desktop */}
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors order-1 sm:order-2"
          >
            Write Review
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors order-2 sm:order-1"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
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
              Showing {paginatedReviews.length} of {totalReviews} reviews for {mintName}
              {mintPubkey && (
                <div className="text-xs text-gray-500 mt-1">
                  🔑 NIP-87 Mint ID: {mintPubkey.substring(0, 16)}...
                </div>
              )}
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

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm
            mintName={mintName}
            mintUrl={mintUrl}
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
            submitting={submitting}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
          <span className="text-gray-400">Fetching reviews from Nostr for {mintName}</span>
        </div>
      )}

      {/* Reviews Content */}
      {!loading && paginatedReviews.length > 0 ? (
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      ) : !loading && filteredReviews.length === 0 && reviews.length > 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Filter className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p>No reviews match the current filters.</p>
          <button
            onClick={resetFilters}
            className="mt-2 text-purple-400 hover:text-purple-300 underline"
          >
            Reset filters
          </button>
        </div>
      ) : !loading ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No reviews yet for {mintName}</p>
          <p className="text-sm text-gray-500">Be the first to review this mint using NIP-87!</p>
        </div>
      ) : null}

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
      {!loading && reviews.length > 0 && hasMoreReviews && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-600 hover:border-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isLoadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                Loading More Reviews...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Load More Reviews
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            {isLoadingMore 
              ? `Searching for more reviews from Nostr...` 
              : `Fetching more NIP-87 reviews from Nostr relay for mint ${mintPubkey ? mintPubkey.substring(0, 16) + '...' : mintName}`
            }
          </p>
        </div>
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && !loading && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
          <span className="text-gray-400">Searching for more reviews...</span>
        </div>
      )}

      {/* All Reviews Loaded Message */}
      {!loading && !isLoadingMore && paginatedReviews.length > 0 && !hasMoreReviews && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            All available reviews loaded ({reviews.length} total)
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsCard; 