import { invoke } from '@tauri-apps/api/core';
import { useEffect } from 'react';

export const useOpener = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      console.log('handling');
      const anchor = (e.target as Element).closest('a');
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);

      // Let internal links (same origin) navigate normally
      if (url.origin === window.location.origin) return;

      e.preventDefault();
      invoke('open_url', { url: anchor.href });
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
};
