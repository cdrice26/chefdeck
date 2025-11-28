import { useEffect, useState } from 'react';

/**
 * Custom hook that returns whether the user prefers a dark color scheme.
 *
 * Listens to the `prefers-color-scheme` media query and updates when it changes.
 *
 * @returns True if the user prefers dark mode, false otherwise.
 */
const useIsDark = (): boolean => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const match = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(match.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    match.addEventListener('change', handler);
    return () => match.removeEventListener('change', handler);
  }, []);
  return isDark;
};

export default useIsDark;
