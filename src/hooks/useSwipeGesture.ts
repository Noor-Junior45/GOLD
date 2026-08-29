import { useRef, useCallback, TouchEvent } from 'react';
import { hapticLight } from '../utils/haptics';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in px to trigger swipe (default: 40)
  maxPerpendicularDistance?: number; // Max drift allowed in orthogonal direction (default: 75)
  enableHaptic?: boolean;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 40,
  maxPerpendicularDistance = 75,
  enableHaptic = true
}: SwipeGestureOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);

  const onTouchStart = useCallback((e: TouchEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    if (e.changedTouches.length !== 1) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX.current;
    const deltaY = touch.clientY - startY.current;
    const duration = Date.now() - startTime.current;

    // Reject slow pans (> 700ms)
    if (duration > 700) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Horizontal Swipe
    if (absX >= threshold && absY <= maxPerpendicularDistance) {
      if (deltaX < 0 && onSwipeLeft) {
        if (enableHaptic) hapticLight();
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        if (enableHaptic) hapticLight();
        onSwipeRight();
      }
      return;
    }

    // Vertical Swipe
    if (absY >= threshold && absX <= maxPerpendicularDistance) {
      if (deltaY < 0 && onSwipeUp) {
        if (enableHaptic) hapticLight();
        onSwipeUp();
      } else if (deltaY > 0 && onSwipeDown) {
        if (enableHaptic) hapticLight();
        onSwipeDown();
      }
    }
  }, [enableHaptic, maxPerpendicularDistance, onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, threshold]);

  return {
    onTouchStart,
    onTouchEnd
  };
}
