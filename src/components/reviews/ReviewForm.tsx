import React, { useState } from 'react';
import { Star, Send, X, AlertCircle } from 'lucide-react';

interface ReviewFormProps {
  mintName: string;
  mintUrl: string;
  onSubmit: (review: {
    rating: number;
    content: string;
  }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  mintName,
  mintUrl,
  onSubmit,
  onCancel,
  submitting
}) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  // Check if browser extension is available
  const hasNostrExtension = typeof window !== 'undefined' && (window as any).nostr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please write a review');
      return;
    }

    if (content.length < 10) {
      alert('Please write a more detailed review (at least 10 characters)');
      return;
    }

    try {
      await onSubmit({
        rating,
        content: content.trim()
      });
      
      // Reset form
      setRating(5);
      setContent('');
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Write a Review for {mintName}</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Browser Extension Info */}
      {!hasNostrExtension && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium mb-1">Browser Extension Required</p>
              <p className="text-blue-200 text-xs">
                To publish reviews, please install a Nostr browser extension like{' '}
                <a 
                  href="https://chrome.google.com/webstore/detail/alby/iokeahhehimjnekafflcihljlcjccdbe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-100"
                >
                  Alby
                </a>
                ,{' '}
                <a 
                  href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-100"
                >
                  nos2x
                </a>
                , or{' '}
                <a 
                  href="https://chrome.google.com/webstore/detail/flamingo/blndijckeohkahjephlcdpbmohmbgjip" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-100"
                >
                  Flamingo
                </a>
                {' '}and refresh this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rating <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-400">
              {rating === 5 && 'Excellent'}
              {rating === 4 && 'Good'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Poor'}
              {rating === 1 && 'Avoid'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Review <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Share your experience with ${mintName}...`}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={4}
            minLength={10}
            maxLength={2000}
            required
          />
          <div className="mt-1 text-xs text-gray-400 flex justify-between">
            <span>Min 10 characters</span>
            <span>{content.length}/2000</span>
          </div>
        </div>

        {/* Submit/Cancel */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !content.trim() || !hasNostrExtension}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Review</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* URL Info */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-xs text-gray-500">
          🔗 Review will be published for: <span className="font-mono">{mintUrl}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          📡 Published to Nostr using NIP-87 protocol
        </p>
      </div>
    </div>
  );
};

export default ReviewForm; 