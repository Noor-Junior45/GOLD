import { useState, useRef, useEffect, useCallback } from 'react';
import { hapticLight, hapticSuccess } from '../utils/haptics';

export interface UsePullToRefreshOptions {
  /** Async callback executed when user pulls past the threshold and releases */
  onRefresh: () => Promise<void> | void;
  /** Distance in pixels required to trigger refresh. Default is 70 */
  threshold?: number;
  /** Maximum distance in pixels the container can be pulled down. Default is 110 */
  maxPull?: number;
  /** Disable the pull-to-refresh interaction */
  disabled?: boolean;
}

export interface UsePullToRefreshReturn {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  progress: number; // 0 to 1
  canRelease: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleTouchStart: (e: React.TouchEvent | TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent | TouchEvent) => void;
  handleTouchEnd: () => void;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 70,
  maxPull = 110,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRelease, setCanRelease] = useState(false);

  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const hasTriggeredHapticRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Check if at the top of scroll
  const isAtTop = useCallback(() => {
    if (containerRef.current) {
      return containerRef.current.scrollTop <= 0 && window.scrollY <= 0;
    }
    return (window.pageYOffset || document.documentElement.scrollTop || 0) <= 0;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (disabled || isRefreshing) return;
      if (!isAtTop()) return;

      const touch = 'touches' in e ? e.touches[0] : null;
      if (!touch) return;

      startYRef.current = touch.clientY;
      isDraggingRef.current = true;
      hasTriggeredHapticRef.current = false;
    },
    [disabled, isRefreshing, isAtTop]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (disabled || isRefreshing || !isDraggingRef.current || startYRef.current === null) return;
      if (!isAtTop()) {
        isDraggingRef.current = false;
        setPullDistance(0);
        setIsPulling(false);
        setCanRelease(false);
        return;
      }

      const touch = 'touches' in e ? e.touches[0] : null;
      if (!touch) return;

      const deltaY = touch.clientY - startYRef.current;
      if (deltaY > 5) {
        setIsPulling(true);
        // Non-linear damping calculation for smooth elastic resistance
        const damped = Math.min(maxPull, Math.pow(deltaY, 0.82) * 1.6);
        setPullDistance(damped);

        const ready = damped >= threshold;
        setCanRelease(ready);

        // Haptic feedback when crossing threshold
        if (ready && !hasTriggeredHapticRef.current) {
          hapticLight();
          hasTriggeredHapticRef.current = true;
        } else if (!ready && hasTriggeredHapticRef.current) {
          hasTriggeredHapticRef.current = false;
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
        setCanRelease(false);
      }
    },
    [disabled, isRefreshing, isAtTop, maxPull, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDraggingRef.current || disabled) return;
    isDraggingRef.current = false;
    startYRef.current = null;
    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(55); // Hold at active spinner height
      hapticSuccess();

      try {
        await onRefresh();
      } catch (err) {
        console.warn('Pull-to-refresh error:', err);
      } finally {
        // Quick visual confirmation before snapping back
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setCanRelease(false);
          hasTriggeredHapticRef.current = false;
        }, 350);
      }
    } else {
      setPullDistance(0);
      setCanRelease(false);
      hasTriggeredHapticRef.current = false;
    }
  }, [disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Bind passive touch listeners to window when pulling starts
  useEffect(() => {
    const handleWindowTouchStart = (e: TouchEvent) => {
      if (isAtTop()) {
        handleTouchStart(e);
      }
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && isAtTop()) {
        handleTouchMove(e);
      }
    };

    const handleWindowTouchEnd = () => {
      if (isDraggingRef.current) {
        handleTouchEnd();
      }
    };

    window.addEventListener('touchstart', handleWindowTouchStart, { passive: true });
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleWindowTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleWindowTouchStart);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
      window.removeEventListener('touchcancel', handleWindowTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isAtTop]);

  const progress = Math.min(1, pullDistance / threshold);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    progress,
    canRelease,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
