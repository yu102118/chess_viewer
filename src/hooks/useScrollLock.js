import { useEffect, useCallback, useRef } from 'react';

/**
 * PRODUCTION-READY SCROLL LOCK HOOK
 *
 * Implements robust body scroll locking with:
 * - Scrollbar width compensation (prevents layout shift)
 * - iOS Safari fix (prevents background scroll)
 * - Nested modal support (stack counter)
 * - Clean restoration on unmount
 * - Scroll position tracking for modal positioning
 *
 * Based on best practices from React Aria, Radix UI, and Chakra UI
 */

// Global counter for nested modals
let scrollLockCount = 0;
let originalBodyStyle = {};
let originalHtmlStyle = {};

/**
 * Measure the browser scrollbar width to compensate for layout shift on lock.
 *
 * @returns {number} Scrollbar width in pixels
 */
function getScrollbarWidth() {
  if (typeof window === 'undefined') return 0;

  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  document.body.removeChild(outer);

  return scrollbarWidth;
}

/**
 * Lock body scroll with scrollbar-width compensation to prevent layout shift.
 * Supports nested locks via a reference counter; styles are applied only on the first lock.
 *
 * @returns {number} The scroll position (scrollY) captured at lock time
 */
function lockScroll() {
  if (typeof window === 'undefined') return 0;

  scrollLockCount++;

  // Only apply styles on first lock
  if (scrollLockCount === 1) {
    const scrollbarWidth = getScrollbarWidth();
    const body = document.body;
    const html = document.documentElement;

    originalBodyStyle = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width
    };

    originalHtmlStyle = {
      overflow: html.style.overflow,
      scrollBehavior: html.style.scrollBehavior
    };

    // Get current scroll position BEFORE locking
    const scrollY = window.scrollY || window.pageYOffset;

    html.style.overflow = 'hidden';
    html.style.scrollBehavior = 'auto'; // Prevent smooth scroll on restore

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    // Compensate for scrollbar width to prevent layout shift
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;

      // Also adjust fixed positioned elements (like navbar)
      const fixedElements = document.querySelectorAll(
        '.fixed-header, [data-fixed]'
      );
      fixedElements.forEach((el) => {
        const currentPadding =
          parseInt(window.getComputedStyle(el).paddingRight) || 0;
        el.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
        el.setAttribute('data-scroll-lock-padding', currentPadding.toString());
      });
    }

    body.setAttribute('data-scroll-lock-y', scrollY.toString());

    return scrollY;
  }

  // Return stored scroll position for nested modals
  const body = document.body;
  return parseInt(body.getAttribute('data-scroll-lock-y') || '0');
}

/**
 * Unlock body scroll and restore the original scroll position and styles.
 * Only restores when the last nested lock is released.
 */
function unlockScroll() {
  if (typeof window === 'undefined') return;

  scrollLockCount = Math.max(0, scrollLockCount - 1);

  // Only restore on last unlock
  if (scrollLockCount === 0) {
    const body = document.body;
    const html = document.documentElement;

    const scrollY = parseInt(body.getAttribute('data-scroll-lock-y') || '0');

    Object.keys(originalBodyStyle).forEach((key) => {
      body.style[key] = originalBodyStyle[key] || '';
    });

    Object.keys(originalHtmlStyle).forEach((key) => {
      html.style[key] = originalHtmlStyle[key] || '';
    });

    window.scrollTo(0, scrollY);

    const fixedElements = document.querySelectorAll(
      '[data-scroll-lock-padding]'
    );
    fixedElements.forEach((el) => {
      const originalPadding = el.getAttribute('data-scroll-lock-padding');
      el.style.paddingRight = originalPadding ? `${originalPadding}px` : '';
      el.removeAttribute('data-scroll-lock-padding');
    });

    body.removeAttribute('data-scroll-lock-y');

    originalBodyStyle = {};
    originalHtmlStyle = {};
  }
}

/**
 * Hook to lock/unlock scroll when component mounts/unmounts
 *
 * @param {boolean} isLocked - Whether scroll should be locked
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowTouchMove - Allow touch move on iOS (default: false)
 * @returns {number} scrollY - The scroll position when lock was applied
 */
export function useScrollLock(isLocked = false, options = {}) {
  const { allowTouchMove = false } = options;

  const isLockedRef = useRef(isLocked);
  const scrollYRef = useRef(0);

  // iOS touch move prevention
  const preventTouchMove = useCallback(
    (e) => {
      if (!allowTouchMove) {
        e.preventDefault();
      }
    },
    [allowTouchMove]
  );

  useEffect(() => {
    isLockedRef.current = isLocked;

    if (isLocked) {
      const scrollY = lockScroll();
      scrollYRef.current = scrollY;

      // iOS Safari specific fix
      if (allowTouchMove === false) {
        document.addEventListener('touchmove', preventTouchMove, {
          passive: false
        });
      }
    } else {
      unlockScroll();

      if (allowTouchMove === false) {
        document.removeEventListener('touchmove', preventTouchMove);
      }
    }

    // Cleanup on unmount
    return () => {
      if (isLockedRef.current) {
        unlockScroll();
        if (allowTouchMove === false) {
          document.removeEventListener('touchmove', preventTouchMove);
        }
      }
    };
  }, [isLocked, allowTouchMove, preventTouchMove]);

  return scrollYRef.current;
}

/**
 * Get current scroll lock count (for debugging)
 */
export function getScrollLockCount() {
  return scrollLockCount;
}

/**
 * Force unlock all scroll locks (emergency cleanup)
 */
export function forceUnlockScroll() {
  scrollLockCount = 0;
  unlockScroll();
}
