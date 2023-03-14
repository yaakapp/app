import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Workspace } from '../lib/models';
import { useWorkspaces } from './useWorkspaces';

export function useActiveWorkspace(): Workspace | null {
  const params = useParams<{ workspaceId?: string }>();
  const workspaces = useWorkspaces();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (workspaces.length === 0) {
      setActiveWorkspace(null);
    } else {
      setActiveWorkspace(workspaces.find((w) => w.id === params.workspaceId) ?? null);
    }
  }, [workspaces, params.workspaceId]);

  return activeWorkspace;
}
