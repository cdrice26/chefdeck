import { invoke } from '@tauri-apps/api/core';
import { useNotification } from 'chefdeck-shared';
import { useState } from 'react';

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { addNotification } = useNotification();

  const sync = async () => {
    if (isSyncing) {
      addNotification('Already syncing', 'info');
      return;
    }
    setIsSyncing(true);
    try {
      await invoke('sync_data');
      addNotification('Data synced successfully', 'success');
    } catch (error) {
      addNotification('Error syncing data', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return { isSyncing, sync };
};
