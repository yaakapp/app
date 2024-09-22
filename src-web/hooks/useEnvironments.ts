import type { Environment } from '@yaakapp-internal/models';
import { atom, useAtom } from 'jotai/index';
import { useEffect } from 'react';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export const environmentsAtom = atom<Environment[]>([]);

export function useEnvironments() {
  const [items, setItems] = useAtom(environmentsAtom);
  const workspace = useActiveWorkspace();

  // Fetch new requests when workspace changes
  useEffect(() => {
    if (workspace == null) return;
    invokeCmd<Environment[]>('cmd_list_environments', { workspaceId: workspace.id }).then(setItems);
  }, [setItems, workspace]);

  return items;
}
