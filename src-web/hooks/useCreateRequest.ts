import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { useNavigate } from 'react-router-dom';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useCreateRequest({ navigateAfter }: { navigateAfter: boolean }) {
  const workspace = useActiveWorkspace();
  const navigate = useNavigate();
  return useMutation<string, unknown, Pick<HttpRequest, 'name'>>({
    mutationFn: async (patch) => {
      if (workspace === null) {
        throw new Error("Cannot create request when there's no active workspace");
      }
      return invoke('create_request', { ...patch, workspaceId: workspace?.id });
    },
    onSuccess: async (requestId) => {
      if (navigateAfter) {
        navigate(`/workspaces/${workspace?.id}/requests/${requestId}`);
      }
    },
  });
}
