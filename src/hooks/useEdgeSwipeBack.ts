import { useEffect, useRef, useCallback } from 'react';
import { hapticLight } from '../utils/haptics';

interface UseEdgeSwipeBackOptions {
  onBack: () => void;
  edgeThreshold?: number; // Starting touch zone from left edge in px (default: 30)
  minSwipeDistance?: number; // Minimum horizontal distance in px (default: 60)
  disabled?: boolean;
}

export function useEdgeSwipeBack({
  onBack,
  edgeThreshold = 30,
  minSwipeDistance = 60,
  disabled = false
}: UseEdgeSwipeBackOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isEdgeTouch = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (touch.clientX <= edgeThreshold) {
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        isEdgeTouch.current = true;
      } else {
        isEdgeTouch.current = false;
      }
    },
    [disabled, edgeThreshold]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isEdgeTouch.current || disabled) return;
      isEdgeTouch.current = false;

      if (e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = Math.abs(touch.clientY - startY.current);

      // Swiped right from left edge with mostly horizontal vector
      if (deltaX >= minSwipeDistance && deltaY <= 50) {
        hapticLight();
        onBack();
      }
    },
    [disabled, minSwipeDistance, onBack]
  );

  useEffect(() => {
    if (disabled) return;

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchEnd]);
}
