import { useCallback, useEffect, useRef } from 'react';

let scrollLockCount = 0;
let originalBodyStyle = {};
let originalHtmlStyle = {};
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

function lockScroll() {
  if (typeof window === 'undefined') return 0;
  scrollLockCount++;
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
    const scrollY = window.scrollY || window.pageYOffset;
    html.style.overflow = 'hidden';
    html.style.scrollBehavior = 'auto';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
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
  const body = document.body;
  return parseInt(body.getAttribute('data-scroll-lock-y') || '0');
}

function unlockScroll() {
  if (typeof window === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
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
 * Locks or unlocks document scroll, preventing body scroll when modals are open.
 *
 * @param {boolean} [isLocked=false] - Whether scroll should be locked
 * @param {Object} [options={}]
 * @param {boolean} [options.allowTouchMove=false] - Allow touch scroll even when locked
 * @returns {void}
 */
export function useScrollLock(isLocked = false, options = {}) {
  const { allowTouchMove = false } = options;
  const isLockedRef = useRef(isLocked);
  const scrollYRef = useRef(0);
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
 * Returns the number of currently active scroll lock consumers.
 *
 * @returns {number}
 */
export function getScrollLockCount() {
  return scrollLockCount;
}
/**
 * Forcefully removes all scroll locks and restores default scroll behaviour.
 *
 * @returns {void}
 */
export function forceUnlockScroll() {
  scrollLockCount = 0;
  unlockScroll();
}
