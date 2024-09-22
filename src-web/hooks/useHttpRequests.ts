import type { HttpRequest } from '@yaakapp-internal/models';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export const httpRequestsAtom = atom<HttpRequest[]>([]);

export function useHttpRequests() {
  const [items, setItems] = useAtom(httpRequestsAtom);
  const workspace = useActiveWorkspace();

  useEffect(() => {
    if (workspace == null) return;
    invokeCmd<HttpRequest[]>('cmd_list_http_requests', { workspaceId: workspace.id }).then(
      setItems,
    );
  }, [setItems, workspace]);

  return items;
}
