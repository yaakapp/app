import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { useNavigate } from 'react-router-dom';
import type { Workspace } from '../lib/models';

export function useCreateWorkspace({ navigateAfter }: { navigateAfter: boolean }) {
  const navigate = useNavigate();
  return useMutation<string, unknown, Pick<Workspace, 'name'>>({
    mutationFn: (patch) => {
      return invoke('create_workspace', patch);
    },
    onSuccess: async (workspaceId) => {
      if (navigateAfter) {
        navigate(`/workspaces/${workspaceId}`);
      }
    },
  });
}
