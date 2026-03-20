import { useEffect, useRef, useState } from 'react';

/**
 * Observes an element and returns whether it is visible in the viewport.
 *
 * @param {Object} [options={}]
 * @param {number} [options.threshold=0.1] - Visibility threshold (0–1)
 * @param {string} [options.rootMargin='50px'] - Root margin for early triggering
 * @returns {{ ref: React.RefObject, isIntersecting: boolean }}
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '50px'
} = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin
      }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);
  return {
    ref,
    isVisible
  };
}
export default useIntersectionObserver;
