import { useState, useRef, useCallback, CSSProperties } from 'react';
import { hapticLight, hapticMedium } from '../utils/haptics';

interface UseBottomSheetDismissOptions {
  onClose: () => void;
  threshold?: number; // Distance in px to trigger dismiss (default: 80)
  disabled?: boolean;
}

export function useBottomSheetDismiss({
  onClose,
  threshold = 80,
  disabled = false
}: UseBottomSheetDismissOptions) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startTime = useRef(0);
  const thresholdHaptic = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (disabled || e.touches.length !== 1) return;
      startY.current = e.touches[0].clientY;
      startTime.current = Date.now();
      setIsDragging(true);
      thresholdHaptic.current = false;
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (!isDragging || disabled) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY.current;

      // Only allow dragging downward
      if (deltaY > 0) {
        setDragY(deltaY);

        if (deltaY >= threshold && !thresholdHaptic.current) {
          thresholdHaptic.current = true;
          hapticLight();
        } else if (deltaY < threshold && thresholdHaptic.current) {
          thresholdHaptic.current = false;
        }
      } else {
        setDragY(0);
      }
    },
    [disabled, isDragging, threshold]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (!isDragging) return;
      setIsDragging(false);

      const deltaY = dragY;
      const duration = Date.now() - startTime.current;
      const velocity = deltaY / Math.max(1, duration);

      // Dismiss if dragged far enough or flicked fast downward
      if (deltaY >= threshold || (deltaY > 35 && velocity > 0.45)) {
        hapticMedium();
        setDragY(500); // Animate down
        setTimeout(() => {
          onClose();
          setDragY(0);
        }, 180);
      } else {
        // Snap back
        setDragY(0);
      }
    },
    [dragY, isDragging, onClose, threshold]
  );

  const dragStyle: CSSProperties = {
    transform: dragY > 0 ? `translate3d(0, ${dragY}px, 0)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
    opacity: dragY > 0 ? Math.max(0.2, 1 - dragY / 350) : 1
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    dragY,
    isDragging,
    dragStyle
  };
}
