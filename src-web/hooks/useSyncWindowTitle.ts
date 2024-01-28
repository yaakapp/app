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

    // TODO: This resets the stoplight position so we can't use it yet
    // appWindow.setTitle(newTitle).catch(console.error);
  }, [activeEnvironment, activeRequest, activeWorkspace]);
}
