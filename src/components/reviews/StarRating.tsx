import React from 'react';
import { Star } from 'lucide-react';
import { RATING_SCALE } from '../../utils/reviewHelpers';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showLabel?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  interactive = false, 
  onRatingChange, 
  showLabel = true 
}) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
          } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
        />
      ))}
      {!interactive && showLabel && rating in RATING_SCALE && (
        <span className={`ml-2 text-xs font-medium ${RATING_SCALE[rating as keyof typeof RATING_SCALE].color}`}>
          {RATING_SCALE[rating as keyof typeof RATING_SCALE].label}
        </span>
      )}
    </div>
  );
};

export default StarRating; 