import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { Navbar } from '@/components/layout';
import { ErrorBoundary } from '@/components/ui';
import { FENBatchProvider, ThemeSettingsProvider } from '@/contexts';
import Routes from '@/routes/Router';
import { logger } from '@/utils/logger';

/**
 * Tool pages where navbar should be hidden for distraction-free experience.
 */
const TOOL_PAGES = ['/settings', '/fen-history', '/advanced-fen'];

/** @type {ReadonlySet<string>} */
const VALID_THEMES = new Set(['light', 'dark']);

/**
 * Retrieves the initial theme from various sources.
 * Priority: window variable > localStorage > system preference.
 *
 * @returns {'light'|'dark'} Theme value
 */
function getInitialTheme() {
  if (
    typeof window !== 'undefined' &&
    typeof window.__INITIAL_THEME__ === 'string' &&
    VALID_THEMES.has(window.__INITIAL_THEME__)
  ) {
    return window.__INITIAL_THEME__;
  }

  try {
    const saved = localStorage.getItem('chess-theme');
    if (saved && VALID_THEMES.has(saved)) {
      return saved;
    }
  } catch (error) {
    logger.warn('localStorage access blocked:', error);
  }

  const prefersDark = window.matchMedia?.(
    '(prefers-color-scheme: dark)'
  ).matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Saves theme to localStorage safely.
 *
 * @param {string} theme - Theme value to save
 */
function saveTheme(theme) {
  try {
    localStorage.setItem('chess-theme', theme);
  } catch (error) {
    logger.warn('localStorage access blocked:', error);
  }
}

/**
 * Main application component.
 * Handles theme management, routing, and layout structure.
 *
 * @returns {JSX.Element} Application root
 */
function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);

  const isToolPage = TOOL_PAGES.includes(location.pathname);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleMediaChange(event) {
      try {
        const manualOverride = localStorage.getItem('chess-theme');
        if (!manualOverride) {
          setTheme(event.matches ? 'dark' : 'light');
        }
      } catch (error) {
        logger.warn('localStorage access blocked:', error);
      }
    }

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ErrorBoundary>
      <ThemeSettingsProvider>
        <FENBatchProvider>
          <div className="min-h-screen bg-gradient-to-br from-bg-gradient-start to-bg-gradient-end transition-colors duration-500">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-accent focus:text-bg focus:rounded-xl focus:shadow-glow focus:font-semibold"
            >
              Skip to main content
            </a>

            {!isToolPage && <Navbar theme={theme} toggleTheme={toggleTheme} />}

            <main
              id="main-content"
              tabIndex={-1}
              className="focus:outline-none"
            >
              <Routes />
            </main>
          </div>
        </FENBatchProvider>
      </ThemeSettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
