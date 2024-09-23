import type { GrpcRequest } from '@yaakapp-internal/models';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export const grpcRequestsAtom = atom<GrpcRequest[]>([]);

export function useGrpcRequests() {
  const [items, setItems] = useAtom(grpcRequestsAtom);
  const workspace = useActiveWorkspace();

  // Fetch new requests when workspace changes
  useEffect(() => {
    if (workspace == null) return;
    invokeCmd<GrpcRequest[]>('cmd_list_grpc_requests', { workspaceId: workspace.id }).then(
      setItems,
    );
  }, [setItems, workspace]);

  return items;
}
