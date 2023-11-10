import { appWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useActiveRequest } from './useActiveRequest';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useSyncWindowTitle() {
  const activeRequest = useActiveRequest();
  const activeWorkspace = useActiveWorkspace();
  const activeEnvironment = useActiveEnvironment();
  useEffect(() => {
    let newTitle = activeWorkspace ? activeWorkspace.name : 'Yaak';
    if (activeEnvironment) {
      newTitle += ` [${activeEnvironment.name}]`;
    }
    if (activeRequest) {
      newTitle += ` – ${fallbackRequestName(activeRequest)}`;
    }
    appWindow.setTitle(newTitle).catch(console.error);
  }, [activeEnvironment, activeRequest, activeWorkspace]);
}
