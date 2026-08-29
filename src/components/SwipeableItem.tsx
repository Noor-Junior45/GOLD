import React, { useState, useRef, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { hapticLight, hapticWarning } from '../utils/haptics';

interface SwipeableItemProps {
  children: ReactNode;
  onDelete?: () => void;
  deleteLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onDelete,
  deleteLabel = 'Remove',
  className = '',
  disabled = false
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef(false);
  const thresholdPassed = useRef(false);

  const maxSwipeDistance = -80; // revealing delete button width
  const autoTriggerDistance = -160; // swipe far enough to auto-delete

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || !onDelete || e.touches.length !== 1) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = false;
    thresholdPassed.current = false;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || disabled || !onDelete) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = Math.abs(currentY - startY.current);

    // Lock direction on first move
    if (!isHorizontal.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > deltaY) {
        isHorizontal.current = true;
      } else if (deltaY > 8) {
        setIsSwiping(false);
        return;
      }
    }

    if (isHorizontal.current) {
      // Swiping left only
      if (deltaX < 0) {
        const dampedX = deltaX * 0.85;
        setOffsetX(dampedX);

        if (dampedX <= maxSwipeDistance && !thresholdPassed.current) {
          thresholdPassed.current = true;
          hapticLight();
        } else if (dampedX > maxSwipeDistance && thresholdPassed.current) {
          thresholdPassed.current = false;
        }
      } else {
        // Swiping right when already opened
        setOffsetX(0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (offsetX <= autoTriggerDistance && onDelete) {
      // Auto-trigger remove if swiped deeply
      hapticWarning();
      setOffsetX(-300);
      setTimeout(() => {
        onDelete();
        setOffsetX(0);
      }, 200);
    } else if (offsetX <= maxSwipeDistance / 2) {
      // Snap to revealed action
      setOffsetX(maxSwipeDistance);
    } else {
      // Snap back closed
      setOffsetX(0);
    }
  };

  const handleManualDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticWarning();
    if (onDelete) onDelete();
    setOffsetX(0);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background action button revealed on swipe */}
      {onDelete && (
        <div className="absolute inset-y-0 right-0 w-24 bg-rose-600 flex items-center justify-center text-white z-0 rounded-2xl">
          <button
            type="button"
            onClick={handleManualDelete}
            className="w-full h-full flex flex-col items-center justify-center gap-1 text-white font-bold text-xs cursor-pointer active:opacity-80"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span className="text-[10px] tracking-tight">{deleteLabel}</span>
          </button>
        </div>
      )}

      {/* Foreground Swipeable Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 bg-white transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${offsetX}px, 0, 0)`
        }}
      >
        {children}
      </div>
    </div>
  );
};
