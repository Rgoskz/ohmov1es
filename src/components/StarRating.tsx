import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: number;
}

export const StarRating = ({ rating, onChange, size = 20 }: StarRatingProps) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={cn('transition-transform', onChange && 'hover:scale-110 cursor-pointer')}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              star <= rating ? 'fill-star text-star' : 'fill-transparent text-star-empty'
            )}
          />
        </button>
      ))}
    </div>
  );
};
