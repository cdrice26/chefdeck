import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';

export function useTauriListener(
  event: string,
  callback: (event: any) => void
) {
  const unlistenRef = useRef<UnlistenFn | null>(null);
  useEffect(() => {
    let isMounted = true;
    async function setup() {
      const unlisten = await listen(event, callback);
      if (isMounted) {
        unlistenRef.current = unlisten;
      }
    }
    setup();
    return () => {
      isMounted = false;
      if (unlistenRef.current) {
        unlistenRef.current();
      }
    };
  }, []);
}
